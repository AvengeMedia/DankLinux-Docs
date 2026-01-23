package gifs_handler

import (
	"net/http"

	"github.com/danielgtaylor/huma/v2"
)

var ErrClientNotConfigured = huma.Error503ServiceUnavailable("klipy client not configured")

var ErrUpstreamRequest = huma.NewError(http.StatusBadGateway, "upstream request failed")
