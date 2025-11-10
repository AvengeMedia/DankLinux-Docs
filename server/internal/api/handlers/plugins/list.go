package plugins_handler

import (
	"context"

	"github.com/AvengeMedia/DankLinux-Docs/server/internal/models"
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/services/registry"
)

type ListPluginsInput struct {
	Category   string `query:"category" doc:"Filter by category"`
	Compositor string `query:"compositor" doc:"Filter by compositor (niri, hyprland, any)"`
	FirstParty string `query:"firstParty" enum:"true,false" doc:"Filter by first party status"`
	Capability string `query:"capability" doc:"Filter by capability"`
}

type ListPluginsResponse struct {
	Body struct {
		Plugins []models.Plugin `json:"plugins"`
		Count   int             `json:"count"`
	}
}

func (self *HandlerGroup) GetPlugins(ctx context.Context, input *ListPluginsInput) (*ListPluginsResponse, error) {
	if self.srv.PluginCache == nil {
		return nil, ErrCacheNotInitialized
	}

	var firstParty *bool
	if input.FirstParty != "" {
		val := input.FirstParty == "true"
		firstParty = &val
	}

	filterOpts := registry.FilterOptions{
		Category:   input.Category,
		Compositor: input.Compositor,
		FirstParty: firstParty,
		Capability: input.Capability,
	}

	plugins := self.srv.PluginCache.FilterPlugins(filterOpts)

	resp := &ListPluginsResponse{}
	resp.Body.Plugins = plugins
	resp.Body.Count = len(plugins)

	return resp, nil
}
