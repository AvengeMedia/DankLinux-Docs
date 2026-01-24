package stickers_handler

import (
	"context"
	"encoding/json"
)

type RecentInput struct {
	CustomerID string `path:"customer_id" required:"true" doc:"Unique user identifier"`
	Page       int    `query:"page" minimum:"1" default:"1" doc:"Page number"`
	PerPage    int    `query:"per_page" minimum:"1" maximum:"32" default:"10" doc:"Items per page"`
}

type RecentOutput struct {
	Body json.RawMessage
}

func (h *HandlerGroup) GetRecent(ctx context.Context, input *RecentInput) (*RecentOutput, error) {
	if h.client == nil {
		return nil, ErrClientNotConfigured
	}

	resp, err := h.client.GetStickersRecent(ctx, input.CustomerID, input.Page, input.PerPage)
	if err != nil {
		return nil, ErrUpstreamRequest
	}

	return &RecentOutput{Body: resp}, nil
}

type DeleteRecentInput struct {
	CustomerID string `path:"customer_id" required:"true" doc:"Unique user identifier"`
	Slug       string `query:"slug" required:"true" doc:"Sticker slug or ID to remove"`
}

type DeleteRecentOutput struct {
	Body json.RawMessage
}

func (h *HandlerGroup) DeleteRecent(ctx context.Context, input *DeleteRecentInput) (*DeleteRecentOutput, error) {
	if h.client == nil {
		return nil, ErrClientNotConfigured
	}

	resp, err := h.client.DeleteStickersRecent(ctx, input.CustomerID, input.Slug)
	if err != nil {
		return nil, ErrUpstreamRequest
	}

	return &DeleteRecentOutput{Body: resp}, nil
}
