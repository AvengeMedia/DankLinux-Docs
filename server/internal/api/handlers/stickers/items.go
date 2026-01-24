package stickers_handler

import (
	"context"
	"encoding/json"
)

type ItemsInput struct {
	IDs   string `query:"ids" doc:"Comma-separated list of sticker IDs"`
	Slugs string `query:"slugs" doc:"Comma-separated list of sticker slugs"`
}

type ItemsOutput struct {
	Body json.RawMessage
}

func (h *HandlerGroup) GetItems(ctx context.Context, input *ItemsInput) (*ItemsOutput, error) {
	if h.client == nil {
		return nil, ErrClientNotConfigured
	}

	resp, err := h.client.GetStickersItems(ctx, input.IDs, input.Slugs)
	if err != nil {
		return nil, ErrUpstreamRequest
	}

	return &ItemsOutput{Body: resp}, nil
}
