package plugins_handler

// Handles initial bootstrapping requirements

import (
	"net/http"

	"github.com/AvengeMedia/DankLinux-Docs/server/internal/api/server"
	"github.com/danielgtaylor/huma/v2"
)

type HandlerGroup struct {
	srv       *server.Server
	setupDone bool
}

func RegisterHandlers(server *server.Server, grp *huma.Group) {
	handlers := &HandlerGroup{
		srv: server,
	}

	huma.Register(
		grp,
		huma.Operation{
			OperationID: "get-plugins",
			Summary:     "Get All Plugins",
			Description: "Get All Plugins from the Dank Linux Registry",
			Path:        "",
			Method:      http.MethodGet,
		},
		handlers.GetPlugins,
	)
}
