package registry

import (
	"context"
	"sync"
	"time"

	"github.com/AvengeMedia/DankLinux-Docs/server/internal/log"
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/models"
)

type Cache struct {
	mu         sync.RWMutex
	plugins    []models.Plugin
	parser     *Parser
	lastUpdate time.Time
}

func NewCache(githubToken string) *Cache {
	return &Cache{
		plugins: []models.Plugin{},
		parser:  NewParser(githubToken),
	}
}

func (c *Cache) Initialize(ctx context.Context) error {
	return c.Refresh(ctx)
}

func (c *Cache) Refresh(ctx context.Context) error {
	log.Info("Refreshing plugin cache...")

	plugins, err := c.parser.FetchPlugins(ctx)
	if err != nil {
		return err
	}

	c.mu.Lock()
	c.plugins = plugins
	c.lastUpdate = time.Now()
	c.mu.Unlock()

	log.Infof("Plugin cache refreshed with %d plugins", len(plugins))
	return nil
}

func (c *Cache) GetPlugins() []models.Plugin {
	c.mu.RLock()
	defer c.mu.RUnlock()

	pluginsCopy := make([]models.Plugin, len(c.plugins))
	copy(pluginsCopy, c.plugins)
	return pluginsCopy
}

func (c *Cache) GetLastUpdate() time.Time {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.lastUpdate
}

type FilterOptions struct {
	Category   string
	Compositor string
	FirstParty bool
	Capability string
}

func (c *Cache) FilterPlugins(opts FilterOptions) []models.Plugin {
	plugins := c.GetPlugins()

	var filtered []models.Plugin
	for _, plugin := range plugins {
		if !matchesFilter(plugin, opts) {
			continue
		}
		filtered = append(filtered, plugin)
	}

	return filtered
}

func matchesFilter(plugin models.Plugin, opts FilterOptions) bool {
	if opts.Category != "" && plugin.Category != opts.Category {
		return false
	}

	if opts.FirstParty && !plugin.FirstParty {
		return false
	}

	if opts.Compositor != "" {
		found := false
		for _, comp := range plugin.Compositors {
			if comp == opts.Compositor || comp == "any" {
				found = true
				break
			}
		}
		if !found {
			return false
		}
	}

	if opts.Capability != "" {
		found := false
		for _, cap := range plugin.Capabilities {
			if cap == opts.Capability {
				found = true
				break
			}
		}
		if !found {
			return false
		}
	}

	return true
}
