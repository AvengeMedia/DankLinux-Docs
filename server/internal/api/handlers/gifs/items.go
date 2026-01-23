package gifs_handler

import (
	"context"
	"encoding/json"
)

type ItemsInput struct {
	IDs   string `query:"ids" doc:"Comma-separated list of GIF IDs"`
	Slugs string `query:"slugs" doc:"Comma-separated list of GIF slugs"`
}

type ItemsOutput struct {
	Body json.RawMessage
}

func (h *HandlerGroup) GetItems(ctx context.Context, input *ItemsInput) (*ItemsOutput, error) {
	if h.client == nil {
		return nil, ErrClientNotConfigured
	}

	resp, err := h.client.GetItems(ctx, input.IDs, input.Slugs)
	if err != nil {
		return nil, ErrUpstreamRequest
	}

	return &ItemsOutput{Body: resp}, nil
}
