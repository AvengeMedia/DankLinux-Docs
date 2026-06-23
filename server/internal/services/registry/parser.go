package registry

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/AvengeMedia/DankLinux-Docs/server/internal/integrations/github"
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/integrations/gitlab"
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/log"
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/models"
)

type Parser struct {
	token   string
	clients map[string]*github.Client
	gitlab  *gitlab.Client
}

func NewParser(token string) *Parser {
	return &Parser{
		token:   token,
		clients: make(map[string]*github.Client),
	}
}

func (p *Parser) getGitLabClient() *gitlab.Client {
	if p.gitlab == nil {
		p.gitlab = gitlab.NewClient("")
	}
	return p.gitlab
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

	p.applyFeedback(ctx, plugins)

	return plugins, nil
}

func (p *Parser) applyFeedback(ctx context.Context, plugins []models.Plugin) {
	feedback, err := p.FetchFeedback(ctx)
	if err != nil {
		log.Warnf("Failed to fetch plugin feedback: %v", err)
		return
	}

	mergeFeedback(plugins, feedback)
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

	if host == "gitlab.com" {
		return p.enrichPluginGitLab(ctx, regPlugin, owner, repo)
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

	metadata, err := parseMetadata(fileData)
	if err != nil {
		return models.Plugin{}, err
	}

	lastCommit, err := client.GetLastCommit(ctx, owner, repo, regPlugin.Path)
	if err != nil {
		return models.Plugin{}, fmt.Errorf("failed to fetch last commit: %w", err)
	}

	return buildPlugin(regPlugin, metadata, lastCommit.Commit.Committer.Date), nil
}

func (p *Parser) enrichPluginGitLab(ctx context.Context, regPlugin models.RegistryPlugin, owner, repo string) (models.Plugin, error) {
	client := p.getGitLabClient()
	project := owner + "/" + repo

	filePath := "plugin.json"
	if regPlugin.Path != "" {
		filePath = regPlugin.Path + "/plugin.json"
	}

	fileData, err := client.GetRawFile(ctx, project, filePath, "HEAD")
	if err != nil {
		return models.Plugin{}, fmt.Errorf("plugin.json not found or inaccessible: %w", err)
	}

	metadata, err := parseMetadata(fileData)
	if err != nil {
		return models.Plugin{}, err
	}

	updatedAt, err := client.GetLastCommitDate(ctx, project, regPlugin.Path)
	if err != nil {
		return models.Plugin{}, fmt.Errorf("failed to fetch last commit: %w", err)
	}

	return buildPlugin(regPlugin, metadata, updatedAt), nil
}

func parseMetadata(data []byte) (models.PluginMetadata, error) {
	var metadata models.PluginMetadata
	if err := json.Unmarshal(data, &metadata); err != nil {
		return models.PluginMetadata{}, fmt.Errorf("invalid plugin.json: %w", err)
	}

	if metadata.Version == "" {
		return models.PluginMetadata{}, fmt.Errorf("plugin.json missing version")
	}

	return metadata, nil
}

func buildPlugin(regPlugin models.RegistryPlugin, metadata models.PluginMetadata, updatedAt time.Time) models.Plugin {
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
		UpdatedAt:    updatedAt,
	}

	if metadata.Author != "" {
		plugin.Author = metadata.Author
	}

	return plugin
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

	return parsedURL.Host, parts[0], strings.TrimSuffix(parts[1], ".git"), nil
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
