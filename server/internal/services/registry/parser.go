package registry

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"strings"

	"github.com/AvengeMedia/DankLinux-Docs/server/internal/integrations/github"
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/log"
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/models"
)

type Parser struct {
	client *github.Client
}

func NewParser(githubToken string) *Parser {
	return &Parser{
		client: github.NewClient(githubToken),
	}
}

func (p *Parser) FetchPlugins(ctx context.Context) ([]models.Plugin, error) {
	registryPlugins, err := p.fetchRegistryPlugins(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch registry plugins: %w", err)
	}

	var plugins []models.Plugin
	for _, regPlugin := range registryPlugins {
		plugin, err := p.enrichPlugin(ctx, regPlugin)
		if err != nil {
			log.Warnf("Skipping plugin %s: %v", regPlugin.ID, err)
			continue
		}

		plugins = append(plugins, plugin)
	}

	return plugins, nil
}

func (p *Parser) fetchRegistryPlugins(ctx context.Context) ([]models.RegistryPlugin, error) {
	contents, err := p.client.GetRepoContents(ctx, "AvengeMedia", "dms-plugin-registry", "plugins")
	if err != nil {
		return nil, fmt.Errorf("failed to get plugins directory: %w", err)
	}

	var plugins []models.RegistryPlugin
	for _, content := range contents {
		if content.Type != "file" {
			continue
		}

		if !strings.HasSuffix(content.Name, ".json") {
			continue
		}

		fileData, err := p.client.GetFileContents(ctx, content.DownloadURL)
		if err != nil {
			log.Warnf("Failed to fetch %s: %v", content.Name, err)
			continue
		}

		var plugin models.RegistryPlugin
		if err := json.Unmarshal(fileData, &plugin); err != nil {
			log.Warnf("Failed to parse %s: %v", content.Name, err)
			continue
		}

		plugins = append(plugins, plugin)
	}

	return plugins, nil
}

func (p *Parser) enrichPlugin(ctx context.Context, regPlugin models.RegistryPlugin) (models.Plugin, error) {
	owner, repo, err := parseRepoURL(regPlugin.Repo)
	if err != nil {
		return models.Plugin{}, fmt.Errorf("invalid repo URL: %w", err)
	}

	pluginPath := regPlugin.Path
	if pluginPath == "" {
		pluginPath = ""
	}

	metadataPath := pluginPath
	if metadataPath != "" {
		metadataPath += "/plugin.json"
	} else {
		metadataPath = "plugin.json"
	}

	contents, err := p.client.GetRepoContents(ctx, owner, repo, metadataPath)
	if err != nil {
		return models.Plugin{}, fmt.Errorf("plugin.json not found or inaccessible: %w", err)
	}

	if len(contents) == 0 {
		return models.Plugin{}, fmt.Errorf("plugin.json not found")
	}

	fileData, err := p.client.GetFileContents(ctx, contents[0].DownloadURL)
	if err != nil {
		return models.Plugin{}, fmt.Errorf("failed to fetch plugin.json: %w", err)
	}

	var metadata models.PluginMetadata
	if err := json.Unmarshal(fileData, &metadata); err != nil {
		return models.Plugin{}, fmt.Errorf("invalid plugin.json: %w", err)
	}

	if metadata.Version == "" {
		return models.Plugin{}, fmt.Errorf("plugin.json missing version")
	}

	repository, err := p.client.GetRepository(ctx, owner, repo)
	if err != nil {
		return models.Plugin{}, fmt.Errorf("failed to fetch repository metadata: %w", err)
	}

	plugin := models.Plugin{
		ID:           regPlugin.ID,
		Name:         regPlugin.Name,
		Capabilities: regPlugin.Capabilities,
		Category:     regPlugin.Category,
		Repo:         regPlugin.Repo,
		Author:       regPlugin.Author,
		FirstParty:   regPlugin.FirstParty,
		Description:  regPlugin.Description,
		Dependencies: regPlugin.Dependencies,
		Compositors:  regPlugin.Compositors,
		Distro:       regPlugin.Distro,
		Screenshot:   regPlugin.Screenshot,
		RequiresDMS:  regPlugin.RequiresDMS,
		Version:      metadata.Version,
		Icon:         metadata.Icon,
		Permissions:  metadata.Permissions,
		UpdatedAt:    repository.UpdatedAt,
	}

	if metadata.Author != "" {
		plugin.Author = metadata.Author
	}

	return plugin, nil
}

func parseRepoURL(repoURL string) (owner, repo string, err error) {
	parsedURL, err := url.Parse(repoURL)
	if err != nil {
		return "", "", err
	}

	parts := strings.Split(strings.Trim(parsedURL.Path, "/"), "/")
	if len(parts) < 2 {
		return "", "", fmt.Errorf("invalid GitHub URL format")
	}

	return parts[0], parts[1], nil
}
