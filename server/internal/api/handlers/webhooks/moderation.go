package webhooks

import (
	"context"
	"strings"

	"github.com/AvengeMedia/DankLinux-Docs/server/internal/log"
)

type Moderator interface {
	IsOrgTeamMember(ctx context.Context, org, team, user string) (bool, error)
	EnsureLabel(ctx context.Context, owner, repo, name, color, description string) error
	AddLabel(ctx context.Context, owner, repo string, issue int, label string) error
	RemoveLabel(ctx context.Context, owner, repo string, issue int, label string) error
	CreateCommentReaction(ctx context.Context, owner, repo string, commentID int64, content string) error
}

type command struct {
	add   bool
	label string
}

type labelMeta struct {
	color       string
	description string
}

var commands = map[string]command{
	"/broken":       {add: true, label: "status:broken"},
	"/working":      {add: false, label: "status:broken"},
	"/unmaintained": {add: true, label: "status:unmaintained"},
	"/deprecated":   {add: true, label: "status:deprecated"},
	"/verified":     {add: true, label: "status:verified"},
}

var statusLabels = map[string]labelMeta{
	"status:broken":       {color: "b60205", description: "Reported broken"},
	"status:unmaintained": {color: "fbca04", description: "No longer maintained"},
	"status:deprecated":   {color: "cccccc", description: "Deprecated / retired"},
	"status:verified":     {color: "0e8a16", description: "Reviewed by maintainers"},
}

func parseCommands(body string) []command {
	var actions []command
	seen := map[string]bool{}

	for _, word := range strings.Fields(body) {
		token := strings.TrimRight(strings.ToLower(word), ".,;:!?")
		cmd, ok := commands[token]
		if !ok || seen[token] {
			continue
		}
		seen[token] = true
		actions = append(actions, cmd)
	}

	return actions
}

func hasPluginLabel(labels []label) bool {
	for _, l := range labels {
		if l.Name == pluginLabel {
			return true
		}
	}
	return false
}

func (h *HandlerGroup) handleComment(p eventPayload) {
	if h.moderator == nil || !hasPluginLabel(p.Issue.Labels) {
		return
	}

	actions := parseCommands(p.Comment.Body)
	if len(actions) == 0 {
		return
	}

	go func() {
		ctx := context.Background()

		member, err := h.moderator.IsOrgTeamMember(ctx, h.org, h.team, p.Comment.User.Login)
		if err != nil {
			log.Error("Failed to check moderator membership", "err", err)
			return
		}
		if !member {
			h.react(ctx, p.Comment.ID, "confused")
			return
		}

		for _, action := range actions {
			h.applyCommand(ctx, p.Issue.Number, action)
		}

		h.react(ctx, p.Comment.ID, "+1")

		if err := h.cache.RefreshFeedback(ctx); err != nil {
			log.Error("Failed to refresh feedback after moderation", "err", err)
		}
	}()
}

func (h *HandlerGroup) applyCommand(ctx context.Context, issue int, action command) {
	if !action.add {
		if err := h.moderator.RemoveLabel(ctx, h.owner, h.repo, issue, action.label); err != nil {
			log.Error("Failed to remove label", "label", action.label, "err", err)
		}
		return
	}

	meta := statusLabels[action.label]
	if err := h.moderator.EnsureLabel(ctx, h.owner, h.repo, action.label, meta.color, meta.description); err != nil {
		log.Error("Failed to ensure label", "label", action.label, "err", err)
		return
	}
	if err := h.moderator.AddLabel(ctx, h.owner, h.repo, issue, action.label); err != nil {
		log.Error("Failed to add label", "label", action.label, "err", err)
	}
}

func (h *HandlerGroup) react(ctx context.Context, commentID int64, content string) {
	if err := h.moderator.CreateCommentReaction(ctx, h.owner, h.repo, commentID, content); err != nil {
		log.Error("Failed to react to comment", "err", err)
	}
}
