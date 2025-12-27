package models

import "time"

type RegistryPlugin struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Capabilities []string `json:"capabilities"`
	Category     string   `json:"category"`
	Repo         string   `json:"repo"`
	Path         string   `json:"path,omitempty"`
	Author       string   `json:"author"`
	FirstParty   bool     `json:"firstParty,omitempty"`
	Description  string   `json:"description"`
	Dependencies []string `json:"dependencies"`
	Compositors  []string `json:"compositors"`
	Distro       []string `json:"distro"`
	Screenshot   string   `json:"screenshot,omitempty"`
	RequiresDMS  string   `json:"requires_dms,omitempty"`
}

type PluginMetadata struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Version     string   `json:"version"`
	Author      string   `json:"author"`
	Icon        string   `json:"icon"`
	FirstParty  bool     `json:"firstParty"`
	Component   string   `json:"component"`
	Settings    string   `json:"settings,omitempty"`
	Permissions []string `json:"permissions"`
}

type Plugin struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Capabilities []string  `json:"capabilities"`
	Category     string    `json:"category"`
	Repo         string    `json:"repo"`
	Author       string    `json:"author"`
	FirstParty   bool      `json:"firstParty"`
	Description  string    `json:"description"`
	Dependencies []string  `json:"dependencies"`
	Compositors  []string  `json:"compositors"`
	Distro       []string  `json:"distro"`
	Screenshot   string    `json:"screenshot"`
	RequiresDMS  string    `json:"requires_dms,omitempty"`
	Version      string    `json:"version"`
	Icon         string    `json:"icon,omitempty"`
	Permissions  []string  `json:"permissions,omitempty"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type ThemeVariantOption struct {
	ID    string                 `json:"id"`
	Name  string                 `json:"name"`
	Dark  map[string]interface{} `json:"dark,omitempty"`
	Light map[string]interface{} `json:"light,omitempty"`
}

type ThemeFlavor struct {
	ID    string                 `json:"id"`
	Name  string                 `json:"name"`
	Dark  map[string]interface{} `json:"dark,omitempty"`
	Light map[string]interface{} `json:"light,omitempty"`
}

type ThemeAccent struct {
	ID     string                            `json:"id"`
	Name   string                            `json:"name"`
	Colors map[string]map[string]interface{} `json:"-"`
}

type ThemeModeDefaults struct {
	Flavor string `json:"flavor"`
	Accent string `json:"accent"`
}

type ThemeVariants struct {
	Type     string                        `json:"type,omitempty"`
	Default  string                        `json:"default,omitempty"`
	Options  []ThemeVariantOption          `json:"options,omitempty"`
	Defaults map[string]*ThemeModeDefaults `json:"defaults,omitempty"`
	Flavors  []ThemeFlavor                 `json:"flavors,omitempty"`
	Accents  []map[string]interface{}      `json:"accents,omitempty"`
}

type Theme struct {
	ID          string                 `json:"id"`
	Name        string                 `json:"name"`
	Author      string                 `json:"author"`
	Description string                 `json:"description"`
	Version     string                 `json:"version"`
	Dark        map[string]interface{} `json:"dark"`
	Light       map[string]interface{} `json:"light"`
	Variants    *ThemeVariants         `json:"variants,omitempty"`
	PreviewURL  string                 `json:"previewUrl"`
	UpdatedAt   time.Time              `json:"updated_at"`
}
