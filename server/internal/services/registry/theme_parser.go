package registry

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/AvengeMedia/DankLinux-Docs/server/internal/log"
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/models"
)

func (p *Parser) FetchThemes(ctx context.Context) ([]models.Theme, error) {
	client, err := p.getClient("github.com")
	if err != nil {
		return nil, err
	}

	contents, err := client.GetRepoContents(ctx, "AvengeMedia", "dms-plugin-registry", "themes")
	if err != nil {
		return nil, fmt.Errorf("failed to get themes directory: %w", err)
	}

	var themes []models.Theme
	for _, content := range contents {
		if content.Type != "dir" {
			continue
		}

		theme, err := p.fetchTheme(ctx, content.Name)
		if err != nil {
			log.Warnf("Skipping theme %s: %v", content.Name, err)
			continue
		}

		themes = append(themes, theme)
	}

	return themes, nil
}

func (p *Parser) fetchTheme(ctx context.Context, themeName string) (models.Theme, error) {
	client, err := p.getClient("github.com")
	if err != nil {
		return models.Theme{}, err
	}

	themeJSONPath := fmt.Sprintf("themes/%s/theme.json", themeName)

	contents, err := client.GetRepoContents(ctx, "AvengeMedia", "dms-plugin-registry", themeJSONPath)
	if err != nil {
		return models.Theme{}, fmt.Errorf("theme.json not found: %w", err)
	}

	if len(contents) == 0 {
		return models.Theme{}, fmt.Errorf("theme.json not found")
	}

	fileData, err := client.GetFileContents(ctx, contents[0].DownloadURL)
	if err != nil {
		return models.Theme{}, fmt.Errorf("failed to fetch theme.json: %w", err)
	}

	var theme models.Theme
	if err := json.Unmarshal(fileData, &theme); err != nil {
		return models.Theme{}, fmt.Errorf("invalid theme.json: %w", err)
	}

	if theme.ID == "" {
		return models.Theme{}, fmt.Errorf("theme.json missing id")
	}

	lastCommit, err := client.GetLastCommit(ctx, "AvengeMedia", "dms-plugin-registry", fmt.Sprintf("themes/%s", themeName))
	if err != nil {
		return models.Theme{}, fmt.Errorf("failed to fetch last commit: %w", err)
	}

	theme.PreviewURL = fmt.Sprintf("https://raw.githubusercontent.com/AvengeMedia/dms-plugin-registry/main/themes/%s/preview.svg", themeName)
	theme.UpdatedAt = lastCommit.Commit.Committer.Date

	return theme, nil
}
