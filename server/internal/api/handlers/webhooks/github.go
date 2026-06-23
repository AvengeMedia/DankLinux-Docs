package webhooks

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/danielgtaylor/huma/v2"

	"github.com/AvengeMedia/DankLinux-Docs/server/internal/log"
)

const refreshDebounce = 2 * time.Second

type FeedbackRefresher interface {
	RefreshFeedback(ctx context.Context) error
}

type HandlerGroup struct {
	secret string
	cache  FeedbackRefresher

	mu          sync.Mutex
	lastRefresh time.Time
}

type WebhookInput struct {
	Event     string `header:"X-GitHub-Event"`
	Signature string `header:"X-Hub-Signature-256"`
	RawBody   []byte
}

type WebhookOutput struct{}

type issuePayload struct {
	Action string `json:"action"`
}

func RegisterHandlers(secret string, cache FeedbackRefresher, grp *huma.Group) {
	h := &HandlerGroup{secret: secret, cache: cache}

	huma.Register(grp, huma.Operation{
		OperationID: "github-webhook",
		Summary:     "GitHub Webhook",
		Path:        "",
		Method:      http.MethodPost,
	}, h.Handle)
}

func (h *HandlerGroup) Handle(_ context.Context, input *WebhookInput) (*WebhookOutput, error) {
	if !h.validSignature(input.RawBody, input.Signature) {
		return nil, huma.Error401Unauthorized("invalid signature")
	}

	if input.Event != "issues" {
		return &WebhookOutput{}, nil
	}

	var payload issuePayload
	if err := json.Unmarshal(input.RawBody, &payload); err != nil {
		return nil, huma.Error400BadRequest("invalid payload")
	}

	if relevantAction(payload.Action) {
		h.triggerRefresh()
	}

	return &WebhookOutput{}, nil
}

func (h *HandlerGroup) validSignature(body []byte, signature string) bool {
	if h.secret == "" || signature == "" {
		return false
	}

	mac := hmac.New(sha256.New, []byte(h.secret))
	mac.Write(body)
	expected := "sha256=" + hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(signature))
}

func (h *HandlerGroup) triggerRefresh() {
	h.mu.Lock()
	if time.Since(h.lastRefresh) < refreshDebounce {
		h.mu.Unlock()
		return
	}
	h.lastRefresh = time.Now()
	h.mu.Unlock()

	go func() {
		if err := h.cache.RefreshFeedback(context.Background()); err != nil {
			log.Error("Webhook feedback refresh failed", "err", err)
		}
	}()
}

func relevantAction(action string) bool {
	switch action {
	case "opened", "closed", "reopened", "labeled", "unlabeled", "deleted":
		return true
	default:
		return false
	}
}
