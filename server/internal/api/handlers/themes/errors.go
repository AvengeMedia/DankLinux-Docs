package themes_handler

import "github.com/danielgtaylor/huma/v2"

var ErrCacheNotReady = huma.Error503ServiceUnavailable("theme cache is warming up")
