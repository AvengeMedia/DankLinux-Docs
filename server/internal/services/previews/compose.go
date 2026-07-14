package previews

import (
	"fmt"
	"image"
	"image/color"
	"math"
	"strings"
	"sync"

	"github.com/AvengeMedia/DankLinux-Docs/server/internal/models"
	"github.com/fogleman/gg"
	"golang.org/x/image/draw"
	"golang.org/x/image/font"
	"golang.org/x/image/font/gofont/gobold"
	"golang.org/x/image/font/gofont/goregular"
	"golang.org/x/image/font/opentype"
)

const (
	cardWidth        = 960
	cardHeight       = 540
	regionInset      = 16.0
	regionWidth      = 928.0
	regionHeight     = 392.0
	regionRadius     = 16.0
	accentHeight     = 4.0
	coverTolerance   = 0.04
	maxUpscale       = 2.0
	blurSampleWidth  = 58
	blurSampleHeight = 26
	blurOverlayAlpha = 0.55
	chipHeight       = 28.0
	chipPadX         = 12.0
	chipGap          = 8.0
)

var (
	colPrimary          = color.NRGBA{R: 0xD0, G: 0xBC, B: 0xFF, A: 0xFF}
	colSurface          = color.NRGBA{R: 0x14, G: 0x12, B: 0x18, A: 0xFF}
	colSurfaceText      = color.NRGBA{R: 0xE6, G: 0xE0, B: 0xE9, A: 0xFF}
	colSurfaceContainer = color.NRGBA{R: 0x21, G: 0x1F, B: 0x24, A: 0xFF}
	colOutline          = color.NRGBA{R: 0x94, G: 0x8F, B: 0x99, A: 0xFF}
	colDescription      = color.NRGBA{R: 0xC4, G: 0xC7, B: 0xC5, A: 0xFF}
)

var statusChipColors = map[string]color.NRGBA{
	"broken":       {R: 0xFF, G: 0xB4, B: 0xAB, A: 0xFF},
	"unmaintained": {R: 0xF9, G: 0xD6, B: 0x8A, A: 0xFF},
	"deprecated":   {R: 0xCF, G: 0xCF, B: 0xCF, A: 0xFF},
	"reviewed":     {R: 0xA9, G: 0xD8, B: 0x9B, A: 0xFF},
}

var (
	fontOnce    sync.Once
	fontErr     error
	regularFont *opentype.Font
	boldFont    *opentype.Font
)

func loadFonts() error {
	fontOnce.Do(func() {
		regularFont, fontErr = opentype.Parse(goregular.TTF)
		if fontErr != nil {
			return
		}
		boldFont, fontErr = opentype.Parse(gobold.TTF)
	})
	if fontErr != nil {
		return fmt.Errorf("failed to parse embedded fonts: %w", fontErr)
	}
	return nil
}

func newFace(f *opentype.Font, size float64) (font.Face, error) {
	face, err := opentype.NewFace(f, &opentype.FaceOptions{Size: size, DPI: 72, Hinting: font.HintingFull})
	if err != nil {
		return nil, fmt.Errorf("failed to create font face: %w", err)
	}
	return face, nil
}

func withAlpha(c color.NRGBA, alpha float64) color.NRGBA {
	c.A = uint8(math.Round(alpha * 255))
	return c
}

func lighten(c color.NRGBA, frac float64) color.NRGBA {
	return color.NRGBA{
		R: lightenChannel(c.R, frac),
		G: lightenChannel(c.G, frac),
		B: lightenChannel(c.B, frac),
		A: c.A,
	}
}

func lightenChannel(v uint8, frac float64) uint8 {
	return uint8(math.Round(float64(v) + (255-float64(v))*frac))
}

func newCanvas() *gg.Context {
	dc := gg.NewContext(cardWidth, cardHeight)
	grad := gg.NewLinearGradient(0, 0, 0, cardHeight)
	grad.AddColorStop(0, colSurface)
	grad.AddColorStop(1, lighten(colSurface, 0.06))
	dc.SetFillStyle(grad)
	dc.DrawRectangle(0, 0, cardWidth, cardHeight)
	dc.Fill()
	return dc
}

func ellipsize(dc *gg.Context, s string, maxW float64) string {
	if w, _ := dc.MeasureString(s); w <= maxW {
		return s
	}
	runes := []rune(s)
	for len(runes) > 0 {
		runes = runes[:len(runes)-1]
		candidate := strings.TrimRight(string(runes), " …") + "…"
		if w, _ := dc.MeasureString(candidate); w <= maxW {
			return candidate
		}
	}
	return "…"
}

type chipSpec struct {
	label string
	text  color.NRGBA
	fill  color.NRGBA
}

func drawChipRow(dc *gg.Context, chips []chipSpec, right, y float64) (float64, error) {
	face, err := newFace(boldFont, 14)
	if err != nil {
		return 0, err
	}
	dc.SetFontFace(face)

	x := right
	for i := len(chips) - 1; i >= 0; i-- {
		chip := chips[i]
		textW, _ := dc.MeasureString(chip.label)
		chipW := textW + 2*chipPadX
		x -= chipW

		dc.SetColor(chip.fill)
		dc.DrawRoundedRectangle(x, y, chipW, chipHeight, chipHeight/2)
		dc.Fill()

		dc.SetColor(chip.text)
		dc.DrawStringAnchored(chip.label, x+chipW/2, y+chipHeight/2, 0.5, 0.35)
		x -= chipGap
	}
	return x + chipGap, nil
}

func footerChips(p models.Plugin) []chipSpec {
	var chips []chipSpec
	if p.Version != "" {
		label := p.Version
		if !strings.HasPrefix(label, "v") {
			label = "v" + label
		}
		chips = append(chips, chipSpec{label: label, text: colSurfaceText, fill: withAlpha(colSurfaceText, 0.10)})
	}
	if p.Category != "" {
		chips = append(chips, chipSpec{label: strings.ToUpper(p.Category), text: colPrimary, fill: withAlpha(colPrimary, 0.15)})
	}
	return chips
}

func drawStatusChips(dc *gg.Context, statuses []string) error {
	var chips []chipSpec
	for _, status := range statuses {
		tint, ok := statusChipColors[status]
		if !ok {
			continue
		}
		chips = append(chips, chipSpec{label: strings.ToUpper(status), text: tint, fill: withAlpha(colSurface, 0.78)})
	}
	if len(chips) == 0 {
		return nil
	}
	_, err := drawChipRow(dc, chips, regionInset+regionWidth-12, regionInset+12)
	return err
}

func drawFooter(dc *gg.Context, p models.Plugin) error {
	dc.SetColor(colPrimary)
	dc.DrawRectangle(0, cardHeight-accentHeight, cardWidth, accentHeight)
	dc.Fill()

	chipLeft := float64(cardWidth - regionInset)
	chips := footerChips(p)
	if len(chips) > 0 {
		left, err := drawChipRow(dc, chips, cardWidth-regionInset, 427)
		if err != nil {
			return err
		}
		chipLeft = left
	}

	nameFace, err := newFace(boldFont, 40)
	if err != nil {
		return err
	}
	dc.SetFontFace(nameFace)
	dc.SetColor(colSurfaceText)
	nameMax := chipLeft - 16 - regionInset
	dc.DrawString(ellipsize(dc, p.Name, nameMax), regionInset, 456)

	if p.Description == "" {
		return nil
	}

	descFace, err := newFace(regularFont, 22)
	if err != nil {
		return err
	}
	dc.SetFontFace(descFace)
	dc.SetColor(colDescription)
	dc.DrawString(ellipsize(dc, p.Description, cardWidth-2*regionInset), regionInset, 496)
	return nil
}

func ComposeScreenshot(src image.Image, p models.Plugin) (image.Image, error) {
	if err := loadFonts(); err != nil {
		return nil, err
	}

	dc := newCanvas()
	dc.SetColor(colSurfaceContainer)
	dc.DrawRoundedRectangle(regionInset, regionInset, regionWidth, regionHeight, regionRadius)
	dc.Fill()

	scaled, x, y := fitRegionImage(src)
	dc.DrawRoundedRectangle(regionInset, regionInset, regionWidth, regionHeight, regionRadius)
	dc.Clip()
	if scaled.Bounds().Dx() < int(regionWidth) || scaled.Bounds().Dy() < int(regionHeight) {
		dc.DrawImage(blurFill(src), int(regionInset), int(regionInset))
		dc.SetColor(withAlpha(colSurface, blurOverlayAlpha))
		dc.DrawRectangle(regionInset, regionInset, regionWidth, regionHeight)
		dc.Fill()
	}
	dc.DrawImage(scaled, x, y)
	dc.ResetClip()

	if err := drawStatusChips(dc, p.Status); err != nil {
		return nil, err
	}
	if err := drawFooter(dc, p); err != nil {
		return nil, err
	}
	return dc.Image(), nil
}

func blurFill(src image.Image) image.Image {
	small := image.NewRGBA(image.Rect(0, 0, blurSampleWidth, blurSampleHeight))
	draw.ApproxBiLinear.Scale(small, small.Bounds(), src, src.Bounds(), draw.Src, nil)
	full := image.NewRGBA(image.Rect(0, 0, int(regionWidth), int(regionHeight)))
	draw.CatmullRom.Scale(full, full.Bounds(), small, small.Bounds(), draw.Src, nil)
	return full
}

func fitRegionImage(src image.Image) (image.Image, int, int) {
	b := src.Bounds()
	sw, sh := float64(b.Dx()), float64(b.Dy())
	regionAR := regionWidth / regionHeight
	srcAR := sw / sh

	scale := math.Min(regionWidth/sw, regionHeight/sh)
	if math.Abs(srcAR-regionAR)/regionAR <= coverTolerance {
		scale = math.Max(regionWidth/sw, regionHeight/sh)
	}
	scale = math.Min(scale, maxUpscale)

	dw := max(int(math.Round(sw*scale)), 1)
	dh := max(int(math.Round(sh*scale)), 1)

	dst := image.NewRGBA(image.Rect(0, 0, dw, dh))
	draw.CatmullRom.Scale(dst, dst.Bounds(), src, b, draw.Over, nil)

	x := int(regionInset) + (int(regionWidth)-dw)/2
	y := int(regionInset) + (int(regionHeight)-dh)/2
	return dst, x, y
}
