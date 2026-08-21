package previews

import (
	"bytes"
	"encoding/xml"
	"fmt"
	"image/color"
	"strconv"
	"strings"

	"github.com/fogleman/gg"
)

type svgText struct {
	x, y    float64
	size    float64
	bold    bool
	anchor  string
	fill    color.NRGBA
	content string
}

type svgFrame struct {
	tx, ty      float64
	unsupported bool
}

func parseTranslate(transform string) (float64, float64, bool) {
	t := strings.TrimSpace(transform)
	if t == "" {
		return 0, 0, true
	}
	if !strings.HasPrefix(t, "translate(") || !strings.HasSuffix(t, ")") {
		return 0, 0, false
	}
	inner := strings.TrimSuffix(strings.TrimPrefix(t, "translate("), ")")
	fields := strings.FieldsFunc(inner, func(r rune) bool { return r == ',' || r == ' ' })
	if len(fields) == 0 || len(fields) > 2 {
		return 0, 0, false
	}
	x, err := strconv.ParseFloat(fields[0], 64)
	if err != nil {
		return 0, 0, false
	}
	y := 0.0
	if len(fields) == 2 {
		y, err = strconv.ParseFloat(fields[1], 64)
		if err != nil {
			return 0, 0, false
		}
	}
	return x, y, true
}

func parseSVGColor(s string) color.NRGBA {
	s = strings.TrimSpace(s)
	if !strings.HasPrefix(s, "#") {
		return color.NRGBA{A: 0xFF}
	}
	hexPart := s[1:]
	if len(hexPart) == 3 {
		hexPart = string([]byte{hexPart[0], hexPart[0], hexPart[1], hexPart[1], hexPart[2], hexPart[2]})
	}
	if len(hexPart) != 6 {
		return color.NRGBA{A: 0xFF}
	}
	v, err := strconv.ParseUint(hexPart, 16, 32)
	if err != nil {
		return color.NRGBA{A: 0xFF}
	}
	return color.NRGBA{R: uint8(v >> 16), G: uint8(v >> 8), B: uint8(v), A: 0xFF}
}

func parseSVGTexts(data []byte) ([]svgText, error) {
	dec := xml.NewDecoder(bytes.NewReader(data))
	var stack []svgFrame
	var texts []svgText
	var active *svgText

	frameAt := func() svgFrame {
		if len(stack) == 0 {
			return svgFrame{}
		}
		return stack[len(stack)-1]
	}

	for {
		tok, err := dec.Token()
		if err != nil {
			break
		}
		switch el := tok.(type) {
		case xml.StartElement:
			parent := frameAt()
			frame := parent
			for _, attr := range el.Attr {
				if attr.Name.Local != "transform" {
					continue
				}
				dx, dy, ok := parseTranslate(attr.Value)
				if !ok {
					frame.unsupported = true
					continue
				}
				frame.tx += dx
				frame.ty += dy
			}
			stack = append(stack, frame)

			if el.Name.Local != "text" {
				continue
			}
			if frame.unsupported {
				return nil, fmt.Errorf("svg text uses an unsupported transform")
			}
			t := svgText{size: 16, anchor: "start", fill: color.NRGBA{A: 0xFF}}
			for _, attr := range el.Attr {
				switch attr.Name.Local {
				case "x":
					t.x, _ = strconv.ParseFloat(attr.Value, 64)
				case "y":
					t.y, _ = strconv.ParseFloat(attr.Value, 64)
				case "font-size":
					if v, err := strconv.ParseFloat(strings.TrimSuffix(attr.Value, "px"), 64); err == nil {
						t.size = v
					}
				case "font-weight":
					if attr.Value == "bold" {
						t.bold = true
						continue
					}
					if v, err := strconv.Atoi(attr.Value); err == nil && v >= 600 {
						t.bold = true
					}
				case "text-anchor":
					t.anchor = attr.Value
				case "fill":
					t.fill = parseSVGColor(attr.Value)
				}
			}
			t.x += frame.tx
			t.y += frame.ty
			active = &t
		case xml.CharData:
			if active != nil {
				active.content += string(el)
			}
		case xml.EndElement:
			if el.Name.Local == "text" && active != nil {
				active.content = strings.TrimSpace(active.content)
				if active.content != "" {
					texts = append(texts, *active)
				}
				active = nil
			}
			if len(stack) > 0 {
				stack = stack[:len(stack)-1]
			}
		}
	}
	return texts, nil
}

func drawSVGTexts(dc *gg.Context, texts []svgText, offsetX, offsetY, scale float64) error {
	if err := loadFonts(); err != nil {
		return err
	}
	for _, t := range texts {
		fnt := regularFont
		if t.bold {
			fnt = boldFont
		}
		face, err := newFace(fnt, t.size*scale)
		if err != nil {
			return err
		}
		dc.SetFontFace(face)
		dc.SetColor(t.fill)

		x := (t.x - offsetX) * scale
		y := (t.y - offsetY) * scale
		w, _ := dc.MeasureString(t.content)
		switch t.anchor {
		case "middle":
			x -= w / 2
		case "end":
			x -= w
		}
		dc.DrawString(t.content, x, y)
	}
	return nil
}
