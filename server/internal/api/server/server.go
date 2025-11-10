package server

import (
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/services/registry"
)

type EmptyInput struct{}

type Server struct {
	PluginCache *registry.Cache
}
