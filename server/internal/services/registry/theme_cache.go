package registry

import (
	"context"
	"sync"
	"time"

	"github.com/AvengeMedia/DankLinux-Docs/server/internal/log"
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/models"
)

type ThemeCache struct {
	mu         sync.RWMutex
	themes     []models.Theme
	parser     *Parser
	lastUpdate time.Time
	ready      bool
}

func NewThemeCache(githubToken string) *ThemeCache {
	return &ThemeCache{
		themes: []models.Theme{},
		parser: NewParser(githubToken),
	}
}

func (c *ThemeCache) Initialize(ctx context.Context) error {
	return c.Refresh(ctx)
}

func (c *ThemeCache) Refresh(ctx context.Context) error {
	log.Info("Refreshing theme cache...")

	themes, err := c.parser.FetchThemes(ctx)
	if err != nil {
		return err
	}

	c.mu.Lock()
	c.themes = themes
	c.lastUpdate = time.Now()
	c.ready = true
	c.mu.Unlock()

	log.Infof("Theme cache refreshed with %d themes", len(themes))
	return nil
}

func (c *ThemeCache) IsReady() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.ready
}

func (c *ThemeCache) GetThemes() []models.Theme {
	c.mu.RLock()
	defer c.mu.RUnlock()

	themesCopy := make([]models.Theme, len(c.themes))
	copy(themesCopy, c.themes)
	return themesCopy
}

func (c *ThemeCache) GetLastUpdate() time.Time {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.lastUpdate
}
