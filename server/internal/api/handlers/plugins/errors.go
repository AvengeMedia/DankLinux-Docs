package plugins_handler

import "github.com/danielgtaylor/huma/v2"

var ErrCacheNotReady = huma.Error503ServiceUnavailable("plugin cache is warming up")
