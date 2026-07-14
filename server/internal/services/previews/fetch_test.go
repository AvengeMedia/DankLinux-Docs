package previews

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"image/png"
	"net"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

func TestNormalizeImageURL(t *testing.T) {
	cases := []struct {
		name string
		in   string
		want string
	}{
		{"github blob", "https://github.com/acmagn/DMS-UPS-Monitor/blob/main/assets/screenshot.png", "https://raw.githubusercontent.com/acmagn/DMS-UPS-Monitor/main/assets/screenshot.png"},
		{"github blob raw query", "https://github.com/o/r/blob/main/s.png?raw=true", "https://raw.githubusercontent.com/o/r/main/s.png"},
		{"github raw already", "https://raw.githubusercontent.com/o/r/main/s.png", "https://raw.githubusercontent.com/o/r/main/s.png"},
		{"github release asset", "https://github.com/o/r/releases/download/v1/s.png", "https://github.com/o/r/releases/download/v1/s.png"},
		{"gitlab blob", "https://gitlab.com/o/r/-/blob/main/s.png", "https://gitlab.com/o/r/-/raw/main/s.png"},
		{"other host", "https://i.imgur.com/abc.png", "https://i.imgur.com/abc.png"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			u, err := url.Parse(tc.in)
			if err != nil {
				t.Fatal(err)
			}
			if got := normalizeImageURL(u).String(); got != tc.want {
				t.Fatalf("normalizeImageURL(%s) = %s, want %s", tc.in, got, tc.want)
			}
		})
	}
}

func allowAllFetcher() *imageFetcher {
	return newImageFetcherWithGuard(func(net.IP) error { return nil })
}

func pngBytes(t *testing.T, w, h int) []byte {
	t.Helper()
	var buf bytes.Buffer
	if err := png.Encode(&buf, image.NewRGBA(image.Rect(0, 0, w, h))); err != nil {
		t.Fatalf("png encode: %v", err)
	}
	return buf.Bytes()
}

func TestFetchSuccess(t *testing.T) {
	data := pngBytes(t, 10, 20)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "image/png")
		w.Write(data)
	}))
	defer server.Close()

	img, err := allowAllFetcher().fetch(context.Background(), server.URL)
	if err != nil {
		t.Fatalf("fetch: %v", err)
	}
	if img.Bounds().Dx() != 10 || img.Bounds().Dy() != 20 {
		t.Fatalf("got %dx%d, want 10x20", img.Bounds().Dx(), img.Bounds().Dy())
	}
}

func TestFetchRejectsLoopbackRedirect(t *testing.T) {
	data := pngBytes(t, 4, 4)
	target := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "image/png")
		w.Write(data)
	}))
	defer target.Close()

	origin := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, target.URL, http.StatusFound)
	}))
	defer origin.Close()

	dials := 0
	f := newImageFetcherWithGuard(func(ip net.IP) error {
		dials++
		if dials == 1 {
			return nil
		}
		return rejectDisallowedIP(ip)
	})

	_, err := f.fetch(context.Background(), origin.URL)
	if err == nil {
		t.Fatal("expected error for redirect to loopback address")
	}
	if !strings.Contains(err.Error(), "disallowed ip") {
		t.Fatalf("expected disallowed ip error, got: %v", err)
	}
}

func TestFetchRejectsDirectLoopback(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	defer server.Close()

	_, err := newImageFetcher().fetch(context.Background(), server.URL)
	if err == nil {
		t.Fatal("expected error for loopback address")
	}
	if !strings.Contains(err.Error(), "disallowed ip") {
		t.Fatalf("expected disallowed ip error, got: %v", err)
	}
}

func TestFetchRejectsTooManyRedirects(t *testing.T) {
	var server *httptest.Server
	server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, server.URL+r.URL.Path+"r", http.StatusFound)
	}))
	defer server.Close()

	_, err := allowAllFetcher().fetch(context.Background(), server.URL+"/")
	if err == nil {
		t.Fatal("expected error for redirect chain")
	}
	if !strings.Contains(err.Error(), "redirects") {
		t.Fatalf("expected redirect limit error, got: %v", err)
	}
}

func TestFetchRejectsOversizedBody(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "image/png")
		chunk := make([]byte, 1<<20)
		for i := 0; i < 9; i++ {
			w.Write(chunk)
		}
	}))
	defer server.Close()

	_, err := allowAllFetcher().fetch(context.Background(), server.URL)
	if err == nil {
		t.Fatal("expected error for oversized body")
	}
	if !strings.Contains(err.Error(), "byte limit") {
		t.Fatalf("expected size limit error, got: %v", err)
	}
}

func TestFetchRejectsNonImageContentType(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		fmt.Fprint(w, "<html></html>")
	}))
	defer server.Close()

	_, err := allowAllFetcher().fetch(context.Background(), server.URL)
	if err == nil {
		t.Fatal("expected error for non-image content type")
	}
	if !strings.Contains(err.Error(), "content type") {
		t.Fatalf("expected content type error, got: %v", err)
	}
}

func TestFetchRasterizesSVG(t *testing.T) {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><rect width="100" height="50" fill="#ff0000"/></svg>`
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "image/svg+xml")
		fmt.Fprint(w, svg)
	}))
	defer server.Close()

	img, err := allowAllFetcher().fetch(context.Background(), server.URL)
	if err != nil {
		t.Fatalf("fetch: %v", err)
	}
	b := img.Bounds()
	if b.Dx() != 1200 || b.Dy() != 600 {
		t.Fatalf("raster size %dx%d, want 1200x600", b.Dx(), b.Dy())
	}
	r, g, _, _ := img.At(600, 300).RGBA()
	if r>>8 < 0xF0 || g>>8 > 0x10 {
		t.Fatalf("expected red center pixel, got r=%d g=%d", r>>8, g>>8)
	}
}

func TestRasterizeSVGRendersText(t *testing.T) {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><rect width="100" height="50" fill="#141218"/><g transform="translate(10 10)"><text x="0" y="20" font-size="14" font-weight="700" fill="#ffffff">HELLO WORLD</text></g></svg>`
	img, err := rasterizeSVG([]byte(svg))
	if err != nil {
		t.Fatalf("rasterizeSVG: %v", err)
	}
	b := img.Bounds()
	lit := 0
	for y := b.Min.Y; y < b.Max.Y; y++ {
		for x := b.Min.X; x < b.Max.X; x++ {
			if r, _, _, _ := img.At(x, y).RGBA(); r>>8 > 0xC0 {
				lit++
			}
		}
	}
	if lit < 500 {
		t.Fatalf("expected rendered text pixels, got %d bright pixels", lit)
	}
}

func TestRasterizeSVGRejectsUnsupportedTextTransform(t *testing.T) {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><g transform="rotate(45)"><text x="10" y="20">hi</text></g></svg>`
	_, err := rasterizeSVG([]byte(svg))
	if err == nil {
		t.Fatal("expected error for text under unsupported transform")
	}
	if !strings.Contains(err.Error(), "unsupported transform") {
		t.Fatalf("expected unsupported-transform error, got: %v", err)
	}
}

func TestFetchRejectsUnsupportedScheme(t *testing.T) {
	_, err := allowAllFetcher().fetch(context.Background(), "file:///etc/passwd")
	if err == nil {
		t.Fatal("expected error for file scheme")
	}
	if !strings.Contains(err.Error(), "unsupported scheme") {
		t.Fatalf("expected scheme error, got: %v", err)
	}
}
