package previews

import (
	"bytes"
	"context"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"math"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/fogleman/gg"
	"github.com/srwiley/oksvg"
	"github.com/srwiley/rasterx"
	_ "golang.org/x/image/webp"
)

const (
	maxImageBytes = 8 << 20
	maxDimension  = 8192
	maxRedirects  = 3
	fetchTimeout  = 15 * time.Second
)

type imageFetcher struct {
	client *http.Client
}

func newImageFetcher() *imageFetcher {
	return newImageFetcherWithGuard(rejectDisallowedIP)
}

func newImageFetcherWithGuard(guard func(net.IP) error) *imageFetcher {
	dialer := &net.Dialer{Timeout: 10 * time.Second}
	transport := &http.Transport{
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			host, port, err := net.SplitHostPort(addr)
			if err != nil {
				return nil, err
			}
			addrs, err := net.DefaultResolver.LookupIPAddr(ctx, host)
			if err != nil {
				return nil, err
			}
			if len(addrs) == 0 {
				return nil, fmt.Errorf("no addresses for host %q", host)
			}
			for _, candidate := range addrs {
				if err := guard(candidate.IP); err != nil {
					return nil, err
				}
			}
			return dialer.DialContext(ctx, network, net.JoinHostPort(addrs[0].IP.String(), port))
		},
	}
	return &imageFetcher{
		client: &http.Client{
			Timeout:   fetchTimeout,
			Transport: transport,
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				if len(via) >= maxRedirects {
					return fmt.Errorf("stopped after %d redirects", maxRedirects)
				}
				if req.URL.Scheme != "http" && req.URL.Scheme != "https" {
					return fmt.Errorf("redirect to unsupported scheme %q", req.URL.Scheme)
				}
				return nil
			},
		},
	}
}

func rejectDisallowedIP(ip net.IP) error {
	if ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() || ip.IsUnspecified() {
		return fmt.Errorf("disallowed ip %s", ip)
	}
	return nil
}

func normalizeImageURL(u *url.URL) *url.URL {
	if u.Host == "github.com" {
		parts := strings.SplitN(strings.TrimPrefix(u.Path, "/"), "/", 4)
		if len(parts) == 4 && parts[2] == "blob" {
			normalized := *u
			normalized.Host = "raw.githubusercontent.com"
			normalized.Path = "/" + parts[0] + "/" + parts[1] + "/" + parts[3]
			normalized.RawQuery = ""
			return &normalized
		}
		return u
	}
	if u.Host == "gitlab.com" && strings.Contains(u.Path, "/-/blob/") {
		normalized := *u
		normalized.Path = strings.Replace(u.Path, "/-/blob/", "/-/raw/", 1)
		return &normalized
	}
	return u
}

func (f *imageFetcher) fetch(ctx context.Context, rawURL string) (image.Image, error) {
	u, err := url.Parse(rawURL)
	if err != nil {
		return nil, fmt.Errorf("invalid image url: %w", err)
	}
	if u.Scheme != "http" && u.Scheme != "https" {
		return nil, fmt.Errorf("unsupported scheme %q", u.Scheme)
	}
	u = normalizeImageURL(u)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := f.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	contentType := strings.ToLower(strings.TrimSpace(resp.Header.Get("Content-Type")))
	if !strings.HasPrefix(contentType, "image/") {
		return nil, fmt.Errorf("unexpected content type %q", contentType)
	}

	data, err := io.ReadAll(io.LimitReader(resp.Body, maxImageBytes+1))
	if err != nil {
		return nil, fmt.Errorf("failed to read image body: %w", err)
	}
	if len(data) > maxImageBytes {
		return nil, fmt.Errorf("image exceeds %d byte limit", maxImageBytes)
	}

	if isSVG(contentType, data) {
		return rasterizeSVG(data)
	}

	cfg, _, err := image.DecodeConfig(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("failed to decode image config: %w", err)
	}
	if cfg.Width > maxDimension || cfg.Height > maxDimension {
		return nil, fmt.Errorf("image dimensions %dx%d exceed limit", cfg.Width, cfg.Height)
	}

	img, _, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}
	return img, nil
}

func isSVG(contentType string, data []byte) bool {
	if strings.HasPrefix(contentType, "image/svg") {
		return true
	}
	head := strings.TrimSpace(string(data[:min(len(data), 512)]))
	return strings.HasPrefix(head, "<svg") || (strings.HasPrefix(head, "<?xml") && strings.Contains(head, "<svg"))
}

func rasterizeSVG(data []byte) (image.Image, error) {
	texts, err := parseSVGTexts(data)
	if err != nil {
		return nil, err
	}

	icon, err := oksvg.ReadIconStream(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("failed to parse svg: %w", err)
	}

	w, h := icon.ViewBox.W, icon.ViewBox.H
	if w <= 0 || h <= 0 {
		return nil, fmt.Errorf("svg has no usable dimensions")
	}

	const targetWidth = 1200.0
	scale := targetWidth / w
	dw := int(math.Round(w * scale))
	dh := int(math.Round(h * scale))
	if dw < 1 || dh < 1 || dw > maxDimension || dh > maxDimension {
		return nil, fmt.Errorf("svg raster size %dx%d out of bounds", dw, dh)
	}

	img := image.NewRGBA(image.Rect(0, 0, dw, dh))
	icon.SetTarget(0, 0, float64(dw), float64(dh))
	icon.Draw(rasterx.NewDasher(dw, dh, rasterx.NewScannerGV(dw, dh, img, img.Bounds())), 1.0)

	if len(texts) == 0 {
		return img, nil
	}
	dc := gg.NewContextForRGBA(img)
	if err := drawSVGTexts(dc, texts, icon.ViewBox.X, icon.ViewBox.Y, scale); err != nil {
		return nil, err
	}
	return dc.Image(), nil
}
