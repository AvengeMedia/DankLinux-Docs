package server

import (
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/services/registry"
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/services/releases"
)

type EmptyInput struct{}

type Server struct {
	PluginCache   *registry.Cache
	ThemeCache    *registry.ThemeCache
	ReleasesCache *releases.Cache
}
