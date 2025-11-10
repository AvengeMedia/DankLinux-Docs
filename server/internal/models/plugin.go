package models

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
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Capabilities []string `json:"capabilities"`
	Category     string   `json:"category"`
	Repo         string   `json:"repo"`
	Author       string   `json:"author"`
	FirstParty   bool     `json:"firstParty"`
	Description  string   `json:"description"`
	Dependencies []string `json:"dependencies"`
	Compositors  []string `json:"compositors"`
	Distro       []string `json:"distro"`
	Screenshot   string   `json:"screenshot"`
	RequiresDMS  string   `json:"requires_dms,omitempty"`
	Version      string   `json:"version"`
	Icon         string   `json:"icon,omitempty"`
	Permissions  []string `json:"permissions,omitempty"`
}
