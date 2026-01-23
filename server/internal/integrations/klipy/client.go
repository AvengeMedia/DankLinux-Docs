package klipy

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const baseURL = "https://api.klipy.com/api/v1"

type Client struct {
	apiKey     string
	httpClient *http.Client
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *Client) doRequest(ctx context.Context, method, path string, query url.Values, body io.Reader) (json.RawMessage, error) {
	fullURL := fmt.Sprintf("%s/%s%s", baseURL, c.apiKey, path)
	if len(query) > 0 {
		fullURL += "?" + query.Encode()
	}

	req, err := http.NewRequestWithContext(ctx, method, fullURL, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	return respBody, nil
}

func (c *Client) GetTrending(ctx context.Context, params TrendingParams) (json.RawMessage, error) {
	query := url.Values{}
	if params.Page > 0 {
		query.Set("page", fmt.Sprintf("%d", params.Page))
	}
	if params.PerPage > 0 {
		query.Set("per_page", fmt.Sprintf("%d", params.PerPage))
	}
	query.Set("customer_id", params.CustomerID)
	if params.Locale != "" {
		query.Set("locale", params.Locale)
	}
	if params.FormatFilter != "" {
		query.Set("format_filter", params.FormatFilter)
	}

	return c.doRequest(ctx, http.MethodGet, "/gifs/trending", query, nil)
}

func (c *Client) Search(ctx context.Context, params SearchParams) (json.RawMessage, error) {
	query := url.Values{}
	if params.Page > 0 {
		query.Set("page", fmt.Sprintf("%d", params.Page))
	}
	if params.PerPage > 0 {
		query.Set("per_page", fmt.Sprintf("%d", params.PerPage))
	}
	query.Set("q", params.Query)
	query.Set("customer_id", params.CustomerID)
	if params.Locale != "" {
		query.Set("locale", params.Locale)
	}
	if params.ContentFilter != "" {
		query.Set("content_filter", params.ContentFilter)
	}
	if params.FormatFilter != "" {
		query.Set("format_filter", params.FormatFilter)
	}

	return c.doRequest(ctx, http.MethodGet, "/gifs/search", query, nil)
}

func (c *Client) GetCategories(ctx context.Context, locale string) (json.RawMessage, error) {
	query := url.Values{}
	if locale != "" {
		query.Set("locale", locale)
	}

	return c.doRequest(ctx, http.MethodGet, "/gifs/categories", query, nil)
}

func (c *Client) GetRecent(ctx context.Context, customerID string, page, perPage int) (json.RawMessage, error) {
	query := url.Values{}
	if page > 0 {
		query.Set("page", fmt.Sprintf("%d", page))
	}
	if perPage > 0 {
		query.Set("per_page", fmt.Sprintf("%d", perPage))
	}

	path := fmt.Sprintf("/gifs/recent/%s", url.PathEscape(customerID))
	return c.doRequest(ctx, http.MethodGet, path, query, nil)
}

func (c *Client) GetItems(ctx context.Context, ids, slugs string) (json.RawMessage, error) {
	query := url.Values{}
	if ids != "" {
		query.Set("ids", ids)
	}
	if slugs != "" {
		query.Set("slugs", slugs)
	}

	return c.doRequest(ctx, http.MethodGet, "/gifs/items", query, nil)
}

func (c *Client) DeleteRecent(ctx context.Context, customerID, slug string) (json.RawMessage, error) {
	query := url.Values{}
	query.Set("slug", slug)

	path := fmt.Sprintf("/gifs/recent/%s", url.PathEscape(customerID))
	return c.doRequest(ctx, http.MethodDelete, path, query, nil)
}

func (c *Client) Share(ctx context.Context, slug string, params ShareParams) (json.RawMessage, error) {
	body := fmt.Sprintf(`{"customer_id":%q,"q":%q}`, params.CustomerID, params.Query)

	path := fmt.Sprintf("/gifs/share/%s", url.PathEscape(slug))
	return c.doRequest(ctx, http.MethodPost, path, nil, strings.NewReader(body))
}

func (c *Client) Report(ctx context.Context, slug string, params ReportParams) (json.RawMessage, error) {
	body := fmt.Sprintf(`{"customer_id":%q,"reason":%q}`, params.CustomerID, params.Reason)

	path := fmt.Sprintf("/gifs/report/%s", url.PathEscape(slug))
	return c.doRequest(ctx, http.MethodPost, path, nil, strings.NewReader(body))
}

type TrendingParams struct {
	Page         int
	PerPage      int
	CustomerID   string
	Locale       string
	FormatFilter string
}

type SearchParams struct {
	Page          int
	PerPage       int
	Query         string
	CustomerID    string
	Locale        string
	ContentFilter string
	FormatFilter  string
}

type ShareParams struct {
	CustomerID string
	Query      string
}

type ReportParams struct {
	CustomerID string
	Reason     string
}
