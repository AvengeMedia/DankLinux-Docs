package stickers_handler

import (
	"context"
	"encoding/json"
)

type CategoriesInput struct {
	Locale string `query:"locale" doc:"Language in xx_YY format (ISO 639-1 + ISO 3166-1)"`
}

type CategoriesOutput struct {
	Body json.RawMessage
}

func (h *HandlerGroup) GetCategories(ctx context.Context, input *CategoriesInput) (*CategoriesOutput, error) {
	if h.client == nil {
		return nil, ErrClientNotConfigured
	}

	resp, err := h.client.GetStickersCategories(ctx, input.Locale)
	if err != nil {
		return nil, ErrUpstreamRequest
	}

	return &CategoriesOutput{Body: resp}, nil
}
