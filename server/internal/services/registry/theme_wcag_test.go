package registry

import (
	"math"
	"testing"

	"github.com/AvengeMedia/DankLinux-Docs/server/internal/models"
)

func TestContrastRatioBlackWhite(t *testing.T) {
	black, _ := parseHexColor("#000000")
	white, _ := parseHexColor("#FFFFFF")

	ratio := contrastRatio(black, white)
	if math.Abs(ratio-21.0) > 0.01 {
		t.Fatalf("expected 21.0, got %f", ratio)
	}
}

func TestContrastRatioAABoundaryGray(t *testing.T) {
	// #767676 on white is the canonical 4.54:1 AA boundary gray
	gray, _ := parseHexColor("#767676")
	white, _ := parseHexColor("#FFFFFF")

	ratio := contrastRatio(gray, white)
	if math.Abs(ratio-4.54) > 0.01 {
		t.Fatalf("expected 4.54, got %f", ratio)
	}
}

func TestParseHexColorRejectsInvalid(t *testing.T) {
	invalid := []interface{}{nil, 42, "", "#fff", "#GGGGGG", "#+12345", "123456#"}
	for _, value := range invalid {
		if _, ok := parseHexColor(value); ok {
			t.Fatalf("expected %v to be rejected", value)
		}
	}
}

func TestWCAGLevelThresholds(t *testing.T) {
	cases := map[float64]string{21.0: "AAA", 7.0: "AAA", 6.99: "AA", 4.5: "AA", 4.49: "fail"}
	for ratio, expected := range cases {
		if got := wcagLevel(ratio); got != expected {
			t.Fatalf("ratio %f: expected %s, got %s", ratio, expected, got)
		}
	}
}

func TestComputeThemeWCAGSimple(t *testing.T) {
	theme := &models.Theme{
		Dark: map[string]interface{}{
			"backgroundText": "#FFFFFF",
			"background":     "#000000",
		},
		Light: map[string]interface{}{
			"backgroundText": "#767676",
			"background":     "#FFFFFF",
		},
	}

	wcag := computeThemeWCAG(theme)
	if wcag == nil {
		t.Fatal("expected report, got nil")
	}
	if wcag.Level != "AA" {
		t.Fatalf("expected overall AA, got %s", wcag.Level)
	}
	if wcag.Dark.Level != "AAA" {
		t.Fatalf("expected dark AAA, got %s", wcag.Dark.Level)
	}
	if wcag.Light.Level != "AA" {
		t.Fatalf("expected light AA, got %s", wcag.Light.Level)
	}
	if wcag.Dark.Variants != nil {
		t.Fatal("expected no variants map for variant-less theme")
	}
}

func TestComputeThemeWCAGVariantsUseDefault(t *testing.T) {
	theme := &models.Theme{
		Dark: map[string]interface{}{
			"backgroundText": "#FFFFFF",
			"background":     "#000000",
		},
		Light: map[string]interface{}{
			"backgroundText": "#FFFFFF",
			"background":     "#000000",
		},
		Variants: &models.ThemeVariants{
			Default: "good",
			Options: []models.ThemeVariantOption{
				{ID: "good"},
				{
					ID:    "bad",
					Dark:  map[string]interface{}{"backgroundText": "#777777", "background": "#888888"},
					Light: map[string]interface{}{"backgroundText": "#777777", "background": "#888888"},
				},
			},
		},
	}

	wcag := computeThemeWCAG(theme)
	if wcag == nil {
		t.Fatal("expected report, got nil")
	}
	if wcag.Level != "AAA" {
		t.Fatalf("expected default variant to drive overall level AAA, got %s", wcag.Level)
	}
	if wcag.Dark.Variants["bad"] != "fail" {
		t.Fatalf("expected bad variant to fail, got %s", wcag.Dark.Variants["bad"])
	}
	if wcag.Dark.Variants["good"] != "AAA" {
		t.Fatalf("expected good variant AAA, got %s", wcag.Dark.Variants["good"])
	}
}

func TestComputeThemeWCAGMultiVariants(t *testing.T) {
	theme := &models.Theme{
		Dark: map[string]interface{}{
			"backgroundText": "#FFFFFF",
			"background":     "#000000",
		},
		Light: map[string]interface{}{
			"backgroundText": "#000000",
			"background":     "#FFFFFF",
		},
		Variants: &models.ThemeVariants{
			Type: "multi",
			Defaults: map[string]*models.ThemeModeDefaults{
				"dark":  {Flavor: "mocha", Accent: "blue"},
				"light": {Flavor: "latte", Accent: "blue"},
			},
			Flavors: []models.ThemeFlavor{
				{ID: "mocha", Dark: map[string]interface{}{"primary": "#89B4FA"}},
				{ID: "latte", Light: map[string]interface{}{"primary": "#1E66F5"}},
			},
			Accents: []map[string]interface{}{
				{
					"id":    "blue",
					"mocha": map[string]interface{}{"primaryText": "#11111B"},
					"latte": map[string]interface{}{"primaryText": "#EFF1F5"},
				},
			},
		},
	}

	wcag := computeThemeWCAG(theme)
	if wcag == nil {
		t.Fatal("expected report, got nil")
	}
	if wcag.Dark == nil || wcag.Light == nil {
		t.Fatal("expected reports for both modes")
	}
	if wcag.Dark.Level != "AAA" {
		t.Fatalf("expected dark AAA, got %s", wcag.Dark.Level)
	}
}

func TestComputeThemeWCAGNoColors(t *testing.T) {
	if wcag := computeThemeWCAG(&models.Theme{}); wcag != nil {
		t.Fatalf("expected nil for theme without colors, got %+v", wcag)
	}
}
