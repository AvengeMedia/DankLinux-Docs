package registry

import (
	"context"
	"regexp"
	"strings"

	"github.com/AvengeMedia/DankLinux-Docs/server/internal/integrations/github"
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/models"
)

const statusLabelPrefix = "status:"

var markerRe = regexp.MustCompile(`<!--\s*dms-plugin-id:\s*([A-Za-z0-9]+)\s*-->`)

type Feedback struct {
	Upvotes     int
	IssueURL    string
	IssueNumber int
	Status      []string
}

func (p *Parser) FetchFeedback(ctx context.Context) (map[string]Feedback, error) {
	client, err := p.getClient("github.com")
	if err != nil {
		return nil, err
	}

	issues, err := client.ListIssues(ctx, "AvengeMedia", "dms-plugin-registry", "plugin")
	if err != nil {
		return nil, err
	}

	feedback := make(map[string]Feedback, len(issues))
	for _, issue := range issues {
		if issue.PullRequest != nil {
			continue
		}

		match := markerRe.FindStringSubmatch(issue.Body)
		if match == nil {
			continue
		}

		feedback[match[1]] = Feedback{
			Upvotes:     issue.Reactions.PlusOne,
			IssueURL:    issue.HTMLURL,
			IssueNumber: issue.Number,
			Status:      extractStatus(issue),
		}
	}

	return feedback, nil
}

func mergeFeedback(plugins []models.Plugin, feedback map[string]Feedback) {
	for i := range plugins {
		fb, ok := feedback[plugins[i].ID]
		if !ok {
			continue
		}
		plugins[i].Upvotes = fb.Upvotes
		plugins[i].IssueURL = fb.IssueURL
		plugins[i].IssueNumber = fb.IssueNumber
		plugins[i].Status = fb.Status
	}
}

func extractStatus(issue github.Issue) []string {
	var status []string
	for _, label := range issue.Labels {
		if !strings.HasPrefix(label.Name, statusLabelPrefix) {
			continue
		}
		status = append(status, strings.TrimPrefix(label.Name, statusLabelPrefix))
	}
	return status
}
