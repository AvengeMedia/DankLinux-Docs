package github

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

type Client struct {
	baseURL    string
	httpClient *http.Client
	token      string
}

func NewClient(token string) *Client {
	return NewClientWithBaseURL("https://api.github.com", token)
}

func NewClientWithBaseURL(baseURL, token string) *Client {
	return &Client{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		token: token,
	}
}

const (
	maxRetries     = 3
	retryBaseDelay = 250 * time.Millisecond
)

var ErrNotFound = errors.New("unexpected status code: 404")

func (c *Client) do(ctx context.Context, method, path string) ([]byte, error) {
	body, _, err := c.doWithHeader(ctx, method, path)
	return body, err
}

func (c *Client) doWithHeader(ctx context.Context, method, path string) ([]byte, http.Header, error) {
	var lastErr error

	for attempt := 0; attempt < maxRetries; attempt++ {
		if attempt > 0 {
			select {
			case <-ctx.Done():
				return nil, nil, ctx.Err()
			case <-time.After(retryBaseDelay << (attempt - 1)):
			}
		}

		body, header, status, err := c.doOnce(ctx, method, path)
		switch {
		case err != nil:
			lastErr = err
		case status == http.StatusOK:
			return body, header, nil
		case status == http.StatusNotFound:
			return nil, nil, ErrNotFound
		default:
			lastErr = fmt.Errorf("unexpected status code: %d", status)
			if !retryableStatus(status) {
				return nil, nil, lastErr
			}
		}
	}

	return nil, nil, lastErr
}

func (c *Client) doOnce(ctx context.Context, method, path string) ([]byte, http.Header, int, error) {
	req, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, nil)
	if err != nil {
		return nil, nil, 0, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Accept", "application/vnd.github.v3+json")
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, nil, 0, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, resp.Header, resp.StatusCode, nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, resp.Header, resp.StatusCode, fmt.Errorf("failed to read response body: %w", err)
	}

	return body, resp.Header, resp.StatusCode, nil
}

func retryableStatus(status int) bool {
	switch status {
	case http.StatusForbidden, http.StatusTooManyRequests,
		http.StatusInternalServerError, http.StatusBadGateway,
		http.StatusServiceUnavailable, http.StatusGatewayTimeout:
		return true
	default:
		return false
	}
}

type RepoContent struct {
	Name        string `json:"name"`
	Path        string `json:"path"`
	Type        string `json:"type"`
	DownloadURL string `json:"download_url"`
	URL         string `json:"url"`
}

func (c *Client) GetRepoContents(ctx context.Context, owner, repo, path string) ([]RepoContent, error) {
	apiPath := fmt.Sprintf("/repos/%s/%s/contents/%s", owner, repo, path)

	body, err := c.do(ctx, http.MethodGet, apiPath)
	if err != nil {
		return nil, err
	}

	var contents []RepoContent
	if err := json.Unmarshal(body, &contents); err != nil {
		var singleContent RepoContent
		if err := json.Unmarshal(body, &singleContent); err != nil {
			return nil, fmt.Errorf("failed to unmarshal response: %w", err)
		}
		return []RepoContent{singleContent}, nil
	}

	return contents, nil
}

func (c *Client) GetFileContents(ctx context.Context, url string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	return body, nil
}

type Commit struct {
	SHA    string `json:"sha"`
	Commit struct {
		Committer struct {
			Date time.Time `json:"date"`
		} `json:"committer"`
	} `json:"commit"`
}

type Issue struct {
	Number      int       `json:"number"`
	HTMLURL     string    `json:"html_url"`
	Body        string    `json:"body"`
	State       string    `json:"state"`
	CreatedAt   time.Time `json:"created_at"`
	PullRequest *struct{} `json:"pull_request,omitempty"`
	Labels      []struct {
		Name string `json:"name"`
	} `json:"labels"`
	Reactions struct {
		PlusOne int `json:"+1"`
	} `json:"reactions"`
}

func (c *Client) ListIssues(ctx context.Context, owner, repo, label string) ([]Issue, error) {
	var issues []Issue

	for page := 1; ; page++ {
		path := fmt.Sprintf("/repos/%s/%s/issues?labels=%s&state=all&per_page=100&page=%d", owner, repo, label, page)

		body, err := c.do(ctx, http.MethodGet, path)
		if err != nil {
			return nil, err
		}

		var batch []Issue
		if err := json.Unmarshal(body, &batch); err != nil {
			return nil, fmt.Errorf("failed to unmarshal issues: %w", err)
		}

		if len(batch) == 0 {
			break
		}

		issues = append(issues, batch...)
	}

	return issues, nil
}

func (c *Client) GetLastCommit(ctx context.Context, owner, repo, path string) (*Commit, error) {
	apiPath := fmt.Sprintf("/repos/%s/%s/commits?per_page=1", owner, repo)
	if path != "" {
		apiPath += fmt.Sprintf("&path=%s", path)
	}

	body, err := c.do(ctx, http.MethodGet, apiPath)
	if err != nil {
		return nil, err
	}

	var commits []Commit
	if err := json.Unmarshal(body, &commits); err != nil {
		return nil, fmt.Errorf("failed to unmarshal commits: %w", err)
	}

	if len(commits) == 0 {
		return nil, fmt.Errorf("no commits found")
	}

	return &commits[0], nil
}

type Release struct {
	TagName     string    `json:"tag_name"`
	HTMLURL     string    `json:"html_url"`
	Body        string    `json:"body"`
	Draft       bool      `json:"draft"`
	Prerelease  bool      `json:"prerelease"`
	PublishedAt time.Time `json:"published_at"`
}

func (c *Client) ListReleases(ctx context.Context, owner, repo string, perPage int) ([]Release, error) {
	body, err := c.do(ctx, http.MethodGet, fmt.Sprintf("/repos/%s/%s/releases?per_page=%d", owner, repo, perPage))
	if err != nil {
		return nil, err
	}

	var releases []Release
	if err := json.Unmarshal(body, &releases); err != nil {
		return nil, fmt.Errorf("failed to unmarshal releases: %w", err)
	}
	return releases, nil
}

// GetRefHead returns the newest commit on ref and the ref's total commit count.
func (c *Client) GetRefHead(ctx context.Context, owner, repo, ref string) (*Commit, int, error) {
	apiPath := fmt.Sprintf("/repos/%s/%s/commits?sha=%s&per_page=1", owner, repo, url.QueryEscape(ref))

	body, header, err := c.doWithHeader(ctx, http.MethodGet, apiPath)
	if err != nil {
		return nil, 0, err
	}

	var commits []Commit
	if err := json.Unmarshal(body, &commits); err != nil {
		return nil, 0, fmt.Errorf("failed to unmarshal commits: %w", err)
	}
	if len(commits) == 0 {
		return nil, 0, fmt.Errorf("no commits found")
	}

	// With per_page=1 the rel="last" page number is the commit count; no Link means a single page.
	count := lastPage(header.Get("Link"))
	if count == 0 {
		count = len(commits)
	}
	return &commits[0], count, nil
}

func lastPage(link string) int {
	for _, part := range strings.Split(link, ",") {
		target, params, ok := strings.Cut(part, ";")
		if !ok || !strings.Contains(params, `rel="last"`) {
			continue
		}
		u, err := url.Parse(strings.Trim(strings.TrimSpace(target), "<>"))
		if err != nil {
			return 0
		}
		n, _ := strconv.Atoi(u.Query().Get("page"))
		return n
	}
	return 0
}

func (c *Client) GetFileAtRef(ctx context.Context, owner, repo, path, ref string) ([]byte, error) {
	apiPath := fmt.Sprintf("/repos/%s/%s/contents/%s?ref=%s", owner, repo, path, url.QueryEscape(ref))

	body, err := c.do(ctx, http.MethodGet, apiPath)
	if err != nil {
		return nil, err
	}

	var file struct {
		Content  string `json:"content"`
		Encoding string `json:"encoding"`
	}
	if err := json.Unmarshal(body, &file); err != nil {
		return nil, fmt.Errorf("failed to unmarshal file: %w", err)
	}
	if file.Encoding != "base64" {
		return nil, fmt.Errorf("unexpected encoding %q", file.Encoding)
	}
	return base64.StdEncoding.DecodeString(strings.ReplaceAll(file.Content, "\n", ""))
}
