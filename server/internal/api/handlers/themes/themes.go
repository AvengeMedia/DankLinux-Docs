package themes_handler

import (
	"net/http"

	"github.com/AvengeMedia/DankLinux-Docs/server/internal/api/server"
	"github.com/danielgtaylor/huma/v2"
)

type HandlerGroup struct {
	srv *server.Server
}

func RegisterHandlers(server *server.Server, grp *huma.Group) {
	handlers := &HandlerGroup{
		srv: server,
	}

	huma.Register(
		grp,
		huma.Operation{
			OperationID: "get-themes",
			Summary:     "Get All Themes",
			Description: "Get All Themes from the Dank Linux Registry",
			Path:        "",
			Method:      http.MethodGet,
		},
		handlers.GetThemes,
	)
}
