package releases_handler

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
			OperationID: "get-dms-releases",
			Summary:     "Get DMS Releases",
			Description: "Recent DankMaterialShell releases with changelog counts and highlights, plus the master branch head",
			Path:        "",
			Method:      http.MethodGet,
		},
		handlers.GetReleases,
	)

	huma.Register(
		grp,
		huma.Operation{
			OperationID: "get-dms-latest-release",
			Summary:     "Get Latest DMS Release",
			Description: "The newest stable DankMaterialShell release",
			Path:        "/latest",
			Method:      http.MethodGet,
		},
		handlers.GetLatest,
	)
}
