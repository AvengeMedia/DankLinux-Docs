package githubapp

import (
	"context"
	"crypto/rsa"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/go-github/v69/github"
)

const auditMarker = "<!-- dms-audit-log -->"
const auditHeader = "### Moderation History"

// Client performs plugin moderation actions through the GitHub API. It can authenticate
// either as a GitHub App installation (so actions are attributed to the App's bot) or with
// a static personal access token as a fallback.
type Client struct {
	owner string
	repo  string

	appID int64
	key   *rsa.PrivateKey
	pat   string

	base *github.Client

	mu          sync.Mutex
	instID      int64
	token       string
	tokenExpiry time.Time
}

func NewApp(appID int64, privateKeyPEM, owner, repo string) (*Client, error) {
	key, err := jwt.ParseRSAPrivateKeyFromPEM([]byte(privateKeyPEM))
	if err != nil {
		return nil, fmt.Errorf("failed to parse app private key: %w", err)
	}

	return &Client{
		owner: owner,
		repo:  repo,
		appID: appID,
		key:   key,
		base:  github.NewClient(&http.Client{Timeout: 30 * time.Second}),
	}, nil
}

func NewToken(pat, owner, repo string) *Client {
	return &Client{
		owner: owner,
		repo:  repo,
		pat:   pat,
		base:  github.NewClient(&http.Client{Timeout: 30 * time.Second}),
	}
}

func (c *Client) authedClient(ctx context.Context) (*github.Client, error) {
	if c.pat != "" {
		return c.base.WithAuthToken(c.pat), nil
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	if c.token != "" && time.Until(c.tokenExpiry) > 5*time.Minute {
		return c.base.WithAuthToken(c.token), nil
	}

	appJWT, err := c.generateJWT()
	if err != nil {
		return nil, err
	}
	appClient := c.base.WithAuthToken(appJWT)

	if c.instID == 0 {
		inst, _, err := appClient.Apps.FindRepositoryInstallation(ctx, c.owner, c.repo)
		if err != nil {
			return nil, fmt.Errorf("failed to find app installation: %w", err)
		}
		c.instID = inst.GetID()
	}

	token, _, err := appClient.Apps.CreateInstallationToken(ctx, c.instID, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create installation token: %w", err)
	}

	c.token = token.GetToken()
	c.tokenExpiry = token.GetExpiresAt().Time
	return c.base.WithAuthToken(c.token), nil
}

func (c *Client) generateJWT() (string, error) {
	now := time.Now()
	claims := jwt.RegisteredClaims{
		IssuedAt:  jwt.NewNumericDate(now.Add(-30 * time.Second)),
		ExpiresAt: jwt.NewNumericDate(now.Add(9 * time.Minute)),
		Issuer:    fmt.Sprintf("%d", c.appID),
	}
	return jwt.NewWithClaims(jwt.SigningMethodRS256, claims).SignedString(c.key)
}

func (c *Client) IsOrgTeamMember(ctx context.Context, org, team, user string) (bool, error) {
	gh, err := c.authedClient(ctx)
	if err != nil {
		return false, err
	}

	membership, resp, err := gh.Teams.GetTeamMembershipBySlug(ctx, org, team, user)
	if err != nil {
		if resp != nil && resp.StatusCode == http.StatusNotFound {
			return false, nil
		}
		return false, err
	}
	return membership.GetState() == "active", nil
}

func (c *Client) EnsureLabel(ctx context.Context, owner, repo, name, color, description string) error {
	gh, err := c.authedClient(ctx)
	if err != nil {
		return err
	}

	_, resp, err := gh.Issues.GetLabel(ctx, owner, repo, name)
	if err == nil {
		return nil
	}
	if resp == nil || resp.StatusCode != http.StatusNotFound {
		return err
	}

	_, _, err = gh.Issues.CreateLabel(ctx, owner, repo, &github.Label{
		Name:        github.Ptr(name),
		Color:       github.Ptr(color),
		Description: github.Ptr(description),
	})
	return err
}

func (c *Client) AddLabel(ctx context.Context, owner, repo string, issue int, label string) error {
	gh, err := c.authedClient(ctx)
	if err != nil {
		return err
	}

	_, _, err = gh.Issues.AddLabelsToIssue(ctx, owner, repo, issue, []string{label})
	return err
}

func (c *Client) RemoveLabel(ctx context.Context, owner, repo string, issue int, label string) error {
	gh, err := c.authedClient(ctx)
	if err != nil {
		return err
	}

	resp, err := gh.Issues.RemoveLabelForIssue(ctx, owner, repo, issue, label)
	if err != nil {
		if resp != nil && resp.StatusCode == http.StatusNotFound {
			return nil
		}
		return err
	}
	return nil
}

func (c *Client) CreateCommentReaction(ctx context.Context, owner, repo string, commentID int64, content string) error {
	gh, err := c.authedClient(ctx)
	if err != nil {
		return err
	}

	_, _, err = gh.Reactions.CreateIssueCommentReaction(ctx, owner, repo, commentID, content)
	return err
}

// AppendAudit records a moderation action in a single bot-owned comment on the issue,
// creating it on first use and appending to it thereafter. The comment survives deletion
// of the moderator's own comment, preserving who did what.
func (c *Client) AppendAudit(ctx context.Context, owner, repo string, issue int, line string) error {
	gh, err := c.authedClient(ctx)
	if err != nil {
		return err
	}

	existing, err := c.findAuditComment(ctx, gh, owner, repo, issue)
	if err != nil {
		return err
	}

	if existing == nil {
		body := fmt.Sprintf("%s\n%s\n\n%s", auditHeader, auditMarker, line)
		_, _, err = gh.Issues.CreateComment(ctx, owner, repo, issue, &github.IssueComment{Body: github.Ptr(body)})
		return err
	}

	body := strings.TrimRight(existing.GetBody(), "\n") + "\n" + line
	_, _, err = gh.Issues.EditComment(ctx, owner, repo, existing.GetID(), &github.IssueComment{Body: github.Ptr(body)})
	return err
}

func (c *Client) findAuditComment(ctx context.Context, gh *github.Client, owner, repo string, issue int) (*github.IssueComment, error) {
	opts := &github.IssueListCommentsOptions{ListOptions: github.ListOptions{PerPage: 100}}

	for {
		comments, resp, err := gh.Issues.ListComments(ctx, owner, repo, issue, opts)
		if err != nil {
			return nil, err
		}

		for _, comment := range comments {
			if strings.Contains(comment.GetBody(), auditMarker) {
				return comment, nil
			}
		}

		if resp.NextPage == 0 {
			return nil, nil
		}
		opts.Page = resp.NextPage
	}
}
