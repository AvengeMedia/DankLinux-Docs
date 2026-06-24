package webhooks

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/AvengeMedia/DankLinux-Docs/server/internal/log"
)

type Moderator interface {
	IsOrgTeamMember(ctx context.Context, org, team, user string) (bool, error)
	EnsureLabel(ctx context.Context, owner, repo, name, color, description string) error
	AddLabel(ctx context.Context, owner, repo string, issue int, label string) error
	RemoveLabel(ctx context.Context, owner, repo string, issue int, label string) error
	CreateCommentReaction(ctx context.Context, owner, repo string, commentID int64, content string) error
	AppendAudit(ctx context.Context, owner, repo string, issue int, line string) error
}

// PluginAuthorLookup resolves a plugin's repository owner (its GitHub author handle)
// so authors can be blocked from marking their own plugins reviewed.
type PluginAuthorLookup interface {
	RepoOwner(pluginID string) (string, bool)
}

var pluginIDMarker = regexp.MustCompile(`<!--\s*dms-plugin-id:\s*([A-Za-z0-9]+)\s*-->`)

// selfRestricted commands cannot be used by a plugin's own author (only an Owner can).
var selfRestrictedLabels = map[string]bool{"status:reviewed": true}

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
	"/review":       {add: true, label: "status:reviewed"},
	"/unreview":     {add: false, label: "status:reviewed"},
}

var statusLabels = map[string]labelMeta{
	"status:broken":       {color: "b60205", description: "Reported broken"},
	"status:unmaintained": {color: "fbca04", description: "No longer maintained"},
	"status:deprecated":   {color: "cccccc", description: "Deprecated / retired"},
	"status:reviewed":     {color: "0e8a16", description: "Reviewed by catalog moderators"},
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
		user := p.Comment.User.Login
		pluginID := extractPluginID(p.Issue.Body)

		isOwner, err := h.moderator.IsOrgTeamMember(ctx, h.org, h.ownersTeam, user)
		if err != nil {
			log.Error("Failed to check owners membership", "err", err)
			return
		}

		if !isOwner {
			isModerator, err := h.moderator.IsOrgTeamMember(ctx, h.org, h.team, user)
			if err != nil {
				log.Error("Failed to check moderator membership", "err", err)
				return
			}
			if !isModerator {
				h.react(ctx, p.Comment.ID, "confused")
				return
			}

			actions = h.filterSelfModeration(pluginID, user, actions)
			if len(actions) == 0 {
				h.react(ctx, p.Comment.ID, "confused")
				return
			}
		}

		timestamp := time.Now().UTC().Format(time.RFC3339)
		var auditLines []string
		for _, action := range actions {
			h.applyCommand(ctx, p.Issue.Number, action)
			if pluginID != "" {
				h.cache.ApplyStatus(pluginID, strings.TrimPrefix(action.label, "status:"), action.add)
			}
			verb := "added"
			if !action.add {
				verb = "removed"
			}
			auditLines = append(auditLines, fmt.Sprintf("- %s · @%s %s `%s`", timestamp, user, verb, action.label))
		}

		h.react(ctx, p.Comment.ID, "+1")

		if err := h.moderator.AppendAudit(ctx, h.owner, h.repo, p.Issue.Number, strings.Join(auditLines, "\n")); err != nil {
			log.Error("Failed to append moderation audit log", "err", err)
		}
	}()
}

func extractPluginID(body string) string {
	match := pluginIDMarker.FindStringSubmatch(body)
	if match == nil {
		return ""
	}
	return match[1]
}

// filterSelfModeration drops review/unreview actions when the commenter is the plugin's
// own author, so a moderator can't mark their own plugin reviewed. Owners bypass this
// entirely (checked earlier).
func (h *HandlerGroup) filterSelfModeration(pluginID, user string, actions []command) []command {
	if h.authors == nil || pluginID == "" {
		return actions
	}

	owner, ok := h.authors.RepoOwner(pluginID)
	if !ok || !strings.EqualFold(owner, user) {
		return actions
	}

	var allowed []command
	for _, action := range actions {
		if selfRestrictedLabels[action.label] {
			log.Warnf("Blocking self-moderation of %s by author @%s", action.label, user)
			continue
		}
		allowed = append(allowed, action)
	}
	return allowed
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
