package previews

import (
	"image"
	"strings"
	"unicode"

	"github.com/AvengeMedia/DankLinux-Docs/server/internal/models"
	"github.com/fogleman/gg"
)

func ComposeCard(p models.Plugin) (image.Image, error) {
	if err := loadFonts(); err != nil {
		return nil, err
	}

	dc := newCanvas()
	dc.SetColor(colSurfaceContainer)
	dc.DrawRoundedRectangle(regionInset, regionInset, regionWidth, regionHeight, regionRadius)
	dc.Fill()

	if err := drawCardRegion(dc, p); err != nil {
		return nil, err
	}
	if err := drawStatusChips(dc, p.Status); err != nil {
		return nil, err
	}
	if err := drawFooter(dc, p); err != nil {
		return nil, err
	}
	return dc.Image(), nil
}

func drawCardRegion(dc *gg.Context, p models.Plugin) error {
	const (
		centerX  = cardWidth / 2.0
		circleY  = 140.0
		circleR  = 76.0
		textMaxW = regionWidth - 80
	)

	dc.SetColor(withAlpha(colPrimary, 0.20))
	dc.DrawCircle(centerX, circleY, circleR)
	dc.Fill()

	letterFace, err := newFace(boldFont, 96)
	if err != nil {
		return err
	}
	dc.SetFontFace(letterFace)
	dc.SetColor(colPrimary)
	dc.DrawStringAnchored(initialLetter(p.Name), centerX, circleY, 0.5, 0.36)

	nameFace, err := newFace(boldFont, 44)
	if err != nil {
		return err
	}
	dc.SetFontFace(nameFace)
	dc.SetColor(colSurfaceText)
	dc.DrawStringAnchored(ellipsize(dc, p.Name, textMaxW), centerX, 270, 0.5, 0.36)

	descFace, err := newFace(regularFont, 20)
	if err != nil {
		return err
	}
	dc.SetFontFace(descFace)
	dc.SetColor(colOutline)
	lines := wrapDescription(dc, p.Description, textMaxW)
	const descStartY, lineH = 314.0, 28.0
	for i, line := range lines {
		dc.DrawStringAnchored(line, centerX, descStartY+lineH*float64(i), 0.5, 0.36)
	}

	if p.Author != "" {
		authorFace, err := newFace(regularFont, 16)
		if err != nil {
			return err
		}
		dc.SetFontFace(authorFace)
		dc.SetColor(colOutline)
		authorY := descStartY + lineH*float64(len(lines)) + 6
		dc.DrawStringAnchored("by "+p.Author, centerX, authorY, 0.5, 0.36)
	}

	markFace, err := newFace(boldFont, 14)
	if err != nil {
		return err
	}
	dc.SetFontFace(markFace)
	dc.SetColor(withAlpha(colPrimary, 0.75))
	dc.DrawStringAnchored("DMS", regionInset+regionWidth-16, regionInset+regionHeight-18, 1, 0.36)
	return nil
}

func wrapDescription(dc *gg.Context, desc string, maxW float64) []string {
	if desc == "" {
		return nil
	}
	lines := dc.WordWrap(desc, maxW)
	if len(lines) <= 3 {
		return lines
	}
	lines = lines[:3]
	lines[2] = ellipsize(dc, lines[2]+"…", maxW)
	return lines
}

func initialLetter(name string) string {
	for _, r := range strings.TrimSpace(name) {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			return strings.ToUpper(string(r))
		}
	}
	return "?"
}
