package releases_handler

import "github.com/danielgtaylor/huma/v2"

var (
	ErrCacheNotReady = huma.Error503ServiceUnavailable("releases cache is warming up")
	ErrNoStable      = huma.Error404NotFound("no stable release found")
)
