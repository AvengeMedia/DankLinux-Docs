package registry

import (
	"context"
	"encoding/json"
	"errors"
	"io/fs"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/AvengeMedia/DankLinux-Docs/server/internal/log"
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/models"
)

type Cache struct {
	mu          sync.RWMutex
	plugins     []models.Plugin
	parser      *Parser
	lastUpdate  time.Time
	ready       bool
	persistPath string
}

type pluginSnapshot struct {
	Plugins    []models.Plugin `json:"plugins"`
	LastUpdate time.Time       `json:"last_update"`
}

func NewCache(githubToken, persistPath string) *Cache {
	return &Cache{
		plugins:     []models.Plugin{},
		parser:      NewParser(githubToken),
		persistPath: persistPath,
	}
}

func (c *Cache) Initialize(ctx context.Context) error {
	if c.persistPath != "" {
		if err := c.loadFromDisk(); err == nil {
			c.mu.RLock()
			n := len(c.plugins)
			c.mu.RUnlock()
			log.Infof("Plugin cache loaded from disk with %d plugins; refreshing in background", n)
		} else if !errors.Is(err, fs.ErrNotExist) {
			log.Warn("Failed to load plugin cache from disk", "err", err)
		}
	}
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
	c.ready = true
	c.mu.Unlock()

	if err := c.saveToDisk(); err != nil {
		log.Warn("Failed to persist plugin cache", "err", err)
	}

	log.Infof("Plugin cache refreshed with %d plugins", len(plugins))
	return nil
}

func (c *Cache) RefreshFeedback(ctx context.Context) error {
	feedback, err := c.parser.FetchFeedback(ctx)
	if err != nil {
		return err
	}

	c.mu.Lock()
	mergeFeedback(c.plugins, feedback)
	c.mu.Unlock()

	if err := c.saveToDisk(); err != nil {
		log.Warn("Failed to persist plugin cache", "err", err)
	}

	log.Info("Plugin feedback refreshed")
	return nil
}

func (c *Cache) loadFromDisk() error {
	data, err := os.ReadFile(c.persistPath)
	if err != nil {
		return err
	}

	var snap pluginSnapshot
	if err := json.Unmarshal(data, &snap); err != nil {
		return err
	}

	c.mu.Lock()
	c.plugins = snap.Plugins
	c.lastUpdate = snap.LastUpdate
	c.ready = true
	c.mu.Unlock()
	return nil
}

func (c *Cache) saveToDisk() error {
	if c.persistPath == "" {
		return nil
	}

	c.mu.RLock()
	snap := pluginSnapshot{
		Plugins:    c.plugins,
		LastUpdate: c.lastUpdate,
	}
	c.mu.RUnlock()

	data, err := json.Marshal(snap)
	if err != nil {
		return err
	}

	if err := os.MkdirAll(filepath.Dir(c.persistPath), 0o755); err != nil {
		return err
	}

	tmp := c.persistPath + ".tmp"
	if err := os.WriteFile(tmp, data, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, c.persistPath)
}

// ApplyStatus updates a plugin's status labels in place so a moderation action is
// reflected immediately, without waiting for the next GitHub re-fetch (which can lag
// behind a just-applied label due to API eventual consistency).
func (c *Cache) ApplyStatus(pluginID, status string, add bool) {
	c.mu.Lock()
	for i := range c.plugins {
		if c.plugins[i].ID == pluginID {
			c.plugins[i].Status = upsertStatus(c.plugins[i].Status, status, add)
			break
		}
	}
	c.mu.Unlock()

	if err := c.saveToDisk(); err != nil {
		log.Warn("Failed to persist plugin cache after status update", "err", err)
	}
}

func upsertStatus(statuses []string, status string, add bool) []string {
	var out []string
	for _, s := range statuses {
		if s != status {
			out = append(out, s)
		}
	}
	if add {
		out = append(out, status)
	}
	return out
}

func (c *Cache) RepoOwner(pluginID string) (string, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	for _, plugin := range c.plugins {
		if plugin.ID != pluginID {
			continue
		}
		_, owner, _, err := parseRepoURL(plugin.Repo)
		if err != nil {
			return "", false
		}
		return owner, true
	}
	return "", false
}

func (c *Cache) IsReady() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.ready
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
	Category      string
	Compositor    string
	FirstParty    bool
	Capability    string
	ExcludeStatus []string
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

	for _, excluded := range opts.ExcludeStatus {
		for _, status := range plugin.Status {
			if status == excluded {
				return false
			}
		}
	}

	return true
}
