package uploads_handler

import (
	"context"
	"crypto/subtle"
	"errors"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/danielgtaylor/huma/v2"
)

const maxUploadBytes = 8 * 1024 * 1024

type HandlerGroup struct {
	uploadDir string
	token     string
}

type UploadInput struct {
	Filename      string `path:"filename" doc:"Target filename" maxLength:"128"`
	Authorization string `header:"Authorization" required:"true" doc:"Bearer <token>"`
	ContentType   string `header:"Content-Type"`
	RawBody       []byte
}

type UploadOutput struct {
	Body struct {
		URL      string `json:"url"`
		Filename string `json:"filename"`
		Size     int    `json:"size"`
	}
}

func RegisterHandlers(uploadDir, token string, grp *huma.Group) {
	h := &HandlerGroup{
		uploadDir: uploadDir,
		token:     token,
	}

	huma.Register(grp, huma.Operation{
		OperationID:  "upload-file",
		Summary:      "Upload a file",
		Description:  "Upload a file by raw body. Requires Authorization: Bearer <token>.",
		Path:         "/{filename}",
		Method:       http.MethodPut,
		MaxBodyBytes: maxUploadBytes,
	}, h.Upload)
}

func (h *HandlerGroup) Upload(_ context.Context, input *UploadInput) (*UploadOutput, error) {
	if h.token == "" {
		return nil, huma.Error503ServiceUnavailable("uploads not configured")
	}

	provided := strings.TrimPrefix(input.Authorization, "Bearer ")
	provided = strings.TrimSpace(provided)
	if subtle.ConstantTimeCompare([]byte(provided), []byte(h.token)) != 1 {
		return nil, huma.Error401Unauthorized("unauthorized")
	}

	name, err := sanitizeFilename(input.Filename)
	if err != nil {
		return nil, huma.Error400BadRequest(err.Error())
	}

	if len(input.RawBody) == 0 {
		return nil, huma.Error400BadRequest("empty body")
	}
	if len(input.RawBody) > maxUploadBytes {
		return nil, huma.Error413RequestEntityTooLarge("file too large")
	}

	if err := os.MkdirAll(h.uploadDir, 0o755); err != nil {
		return nil, huma.Error500InternalServerError("failed to prepare upload directory")
	}

	dst := filepath.Join(h.uploadDir, name)
	tmp := dst + ".tmp"
	if err := os.WriteFile(tmp, input.RawBody, 0o644); err != nil {
		return nil, huma.Error500InternalServerError("failed to write file")
	}
	if err := os.Rename(tmp, dst); err != nil {
		_ = os.Remove(tmp)
		return nil, huma.Error500InternalServerError("failed to finalize upload")
	}

	out := &UploadOutput{}
	out.Body.URL = "/uploads/" + name
	out.Body.Filename = name
	out.Body.Size = len(input.RawBody)
	return out, nil
}

// ServeFile serves an uploaded file by filename. Intended to be wired directly
// onto the chi router so http.ServeFile can stream and handle Range/ETag.
func ServeFile(uploadDir, filename string, w http.ResponseWriter, r *http.Request) {
	name, err := sanitizeFilename(filename)
	if err != nil {
		http.NotFound(w, r)
		return
	}

	path := filepath.Join(uploadDir, name)
	info, err := os.Stat(path)
	if err != nil {
		if errors.Is(err, fs.ErrNotExist) {
			http.NotFound(w, r)
			return
		}
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	if info.IsDir() {
		http.NotFound(w, r)
		return
	}

	// SVG and other text-like assets can contain script; prevent the browser
	// from treating them as anything other than the declared content-type, and
	// keep them from running in the same origin context.
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox")
	w.Header().Set("Cache-Control", "public, max-age=300")
	http.ServeFile(w, r, path)
}

func sanitizeFilename(name string) (string, error) {
	if name == "" {
		return "", errors.New("filename required")
	}
	// Disallow any path separators or traversal segments.
	if strings.ContainsAny(name, `/\`) {
		return "", errors.New("filename must not contain path separators")
	}
	if name == "." || name == ".." {
		return "", errors.New("invalid filename")
	}
	cleaned := filepath.Clean(name)
	if cleaned != name {
		return "", errors.New("invalid filename")
	}
	return cleaned, nil
}
