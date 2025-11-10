package plugins_handler

import (
	"context"
	"math/rand"
	"reflect"
	"sort"

	"github.com/AvengeMedia/DankLinux-Docs/server/internal/models"
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/services/registry"
	"github.com/danielgtaylor/huma/v2"
)

type PluginSortBy string

const (
	SortByUpdatedAt PluginSortBy = "updated_at"
	SortByName      PluginSortBy = "name"
	SortByRandom    PluginSortBy = "random"
)

func (u PluginSortBy) Schema(r huma.Registry) *huma.Schema {
	if r.Map()["PluginSortBy"] == nil {
		schemaRef := r.Schema(reflect.TypeOf(""), true, "PluginSortBy")
		schemaRef.Title = "PluginSortBy"
		schemaRef.Enum = append(schemaRef.Enum, []any{
			string(SortByUpdatedAt),
			string(SortByName),
			string(SortByRandom),
		}...)
		r.Map()["PluginSortBy"] = schemaRef
	}
	return &huma.Schema{Ref: "#/components/schemas/PluginSortBy"}
}

type ListPluginsInput struct {
	Category   string       `query:"category" doc:"Filter by category"`
	Compositor string       `query:"compositor" doc:"Filter by compositor (niri, hyprland, any)"`
	FirstParty bool         `query:"firstParty" doc:"Only show first-party plugins"`
	Capability string       `query:"capability" doc:"Filter by capability"`
	SortBy     PluginSortBy `query:"sortBy" doc:"Sort plugins by field"`
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

	filterOpts := registry.FilterOptions{
		Category:   input.Category,
		Compositor: input.Compositor,
		FirstParty: input.FirstParty,
		Capability: input.Capability,
	}

	plugins := self.srv.PluginCache.FilterPlugins(filterOpts)

	sortBy := input.SortBy
	if sortBy == "" {
		sortBy = SortByUpdatedAt
	}

	switch sortBy {
	case SortByUpdatedAt:
		sort.Slice(plugins, func(i, j int) bool {
			return plugins[i].UpdatedAt.After(plugins[j].UpdatedAt)
		})
	case SortByName:
		sort.Slice(plugins, func(i, j int) bool {
			return plugins[i].Name < plugins[j].Name
		})
	case SortByRandom:
		rand.Shuffle(len(plugins), func(i, j int) {
			plugins[i], plugins[j] = plugins[j], plugins[i]
		})
	}

	resp := &ListPluginsResponse{}
	resp.Body.Plugins = plugins
	resp.Body.Count = len(plugins)

	return resp, nil
}
