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
	SortByUpvotes   PluginSortBy = "upvotes"
	SortByUpdatedAt PluginSortBy = "updated_at"
	SortByNewest    PluginSortBy = "newest"
	SortByOldest    PluginSortBy = "oldest"
	SortByName      PluginSortBy = "name"
	SortByRandom    PluginSortBy = "random"
)

func (u PluginSortBy) Schema(r huma.Registry) *huma.Schema {
	if r.Map()["PluginSortBy"] == nil {
		schemaRef := r.Schema(reflect.TypeOf(""), true, "PluginSortBy")
		schemaRef.Title = "PluginSortBy"
		schemaRef.Enum = append(schemaRef.Enum, []any{
			string(SortByUpvotes),
			string(SortByUpdatedAt),
			string(SortByNewest),
			string(SortByOldest),
			string(SortByName),
			string(SortByRandom),
		}...)
		r.Map()["PluginSortBy"] = schemaRef
	}
	return &huma.Schema{Ref: "#/components/schemas/PluginSortBy"}
}

type ListPluginsInput struct {
	Category      string       `query:"category" doc:"Filter by category"`
	Compositor    string       `query:"compositor" doc:"Filter by compositor (niri, hyprland, any)"`
	FirstParty    bool         `query:"firstParty" doc:"Only show first-party plugins"`
	Capability    string       `query:"capability" doc:"Filter by capability"`
	ExcludeStatus []string     `query:"excludeStatus" doc:"Exclude plugins with these status labels (e.g. broken, deprecated)"`
	SortBy        PluginSortBy `query:"sortBy" doc:"Sort plugins by field"`
}

type ListPluginsResponse struct {
	Body struct {
		Plugins []models.Plugin `json:"plugins"`
		Count   int             `json:"count"`
	}
}

func (self *HandlerGroup) GetPlugins(ctx context.Context, input *ListPluginsInput) (*ListPluginsResponse, error) {
	if self.srv.PluginCache == nil || !self.srv.PluginCache.IsReady() {
		return nil, ErrCacheNotReady
	}

	filterOpts := registry.FilterOptions{
		Category:      input.Category,
		Compositor:    input.Compositor,
		FirstParty:    input.FirstParty,
		Capability:    input.Capability,
		ExcludeStatus: input.ExcludeStatus,
	}

	plugins := self.srv.PluginCache.FilterPlugins(filterOpts)

	sortBy := input.SortBy
	if sortBy == "" {
		sortBy = SortByUpvotes
	}

	switch sortBy {
	case SortByUpvotes:
		sort.Slice(plugins, func(i, j int) bool {
			if plugins[i].Upvotes != plugins[j].Upvotes {
				return plugins[i].Upvotes > plugins[j].Upvotes
			}
			if vi, vj := isReviewed(plugins[i]), isReviewed(plugins[j]); vi != vj {
				return vi
			}
			return plugins[i].UpdatedAt.After(plugins[j].UpdatedAt)
		})
	case SortByUpdatedAt, SortByNewest:
		sort.Slice(plugins, func(i, j int) bool {
			return plugins[i].UpdatedAt.After(plugins[j].UpdatedAt)
		})
	case SortByOldest:
		sort.Slice(plugins, func(i, j int) bool {
			return plugins[i].UpdatedAt.Before(plugins[j].UpdatedAt)
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

func isReviewed(plugin models.Plugin) bool {
	for _, status := range plugin.Status {
		if status == "reviewed" {
			return true
		}
	}
	return false
}
