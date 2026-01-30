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
	token   string
	clients map[string]*github.Client
}

func NewParser(token string) *Parser {
	return &Parser{
		token:   token,
		clients: make(map[string]*github.Client),
	}
}

func (p *Parser) getClient(host string) (*github.Client, error) {
	if client, ok := p.clients[host]; ok {
		return client, nil
	}

	baseURL, err := getAPIBaseURL(host)
	if err != nil {
		return nil, err
	}

	token := ""
	if host == "github.com" {
		token = p.token
	}

	client := github.NewClientWithBaseURL(baseURL, token)
	p.clients[host] = client
	return client, nil
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
	client, err := p.getClient("github.com")
	if err != nil {
		return nil, err
	}

	contents, err := client.GetRepoContents(ctx, "AvengeMedia", "dms-plugin-registry", "plugins")
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

		fileData, err := client.GetFileContents(ctx, content.DownloadURL)
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
	host, owner, repo, err := parseRepoURL(regPlugin.Repo)
	if err != nil {
		return models.Plugin{}, fmt.Errorf("invalid repo URL: %w", err)
	}

	client, err := p.getClient(host)
	if err != nil {
		return models.Plugin{}, err
	}

	metadataPath := "plugin.json"
	if regPlugin.Path != "" {
		metadataPath = regPlugin.Path + "/plugin.json"
	}

	contents, err := client.GetRepoContents(ctx, owner, repo, metadataPath)
	if err != nil {
		return models.Plugin{}, fmt.Errorf("plugin.json not found or inaccessible: %w", err)
	}

	if len(contents) == 0 {
		return models.Plugin{}, fmt.Errorf("plugin.json not found")
	}

	fileData, err := client.GetFileContents(ctx, contents[0].DownloadURL)
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

	lastCommit, err := client.GetLastCommit(ctx, owner, repo, regPlugin.Path)
	if err != nil {
		return models.Plugin{}, fmt.Errorf("failed to fetch last commit: %w", err)
	}

	plugin := models.Plugin{
		ID:           regPlugin.ID,
		Name:         regPlugin.Name,
		Capabilities: regPlugin.Capabilities,
		Category:     regPlugin.Category,
		Repo:         regPlugin.Repo,
		Author:       regPlugin.Author,
		FirstParty:   regPlugin.FirstParty,
		Featured:     regPlugin.Featured,
		Description:  regPlugin.Description,
		Dependencies: regPlugin.Dependencies,
		Compositors:  regPlugin.Compositors,
		Distro:       regPlugin.Distro,
		Screenshot:   regPlugin.Screenshot,
		RequiresDMS:  regPlugin.RequiresDMS,
		Version:      metadata.Version,
		Icon:         metadata.Icon,
		Permissions:  metadata.Permissions,
		UpdatedAt:    lastCommit.Commit.Committer.Date,
	}

	if metadata.Author != "" {
		plugin.Author = metadata.Author
	}

	return plugin, nil
}

func parseRepoURL(repoURL string) (host, owner, repo string, err error) {
	parsedURL, err := url.Parse(repoURL)
	if err != nil {
		return "", "", "", err
	}

	parts := strings.Split(strings.Trim(parsedURL.Path, "/"), "/")
	if len(parts) < 2 {
		return "", "", "", fmt.Errorf("invalid repo URL format")
	}

	return parsedURL.Host, parts[0], parts[1], nil
}

func getAPIBaseURL(host string) (string, error) {
	switch host {
	case "github.com":
		return "https://api.github.com", nil
	case "codeberg.org":
		return "https://codeberg.org/api/v1", nil
	default:
		return "", fmt.Errorf("unsupported git host: %s", host)
	}
}
