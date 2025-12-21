package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/AvengeMedia/DankLinux-Docs/server/config"
	plugins_handler "github.com/AvengeMedia/DankLinux-Docs/server/internal/api/handlers/plugins"
	themes_handler "github.com/AvengeMedia/DankLinux-Docs/server/internal/api/handlers/themes"
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/api/middleware"
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/api/server"
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/log"
	"github.com/AvengeMedia/DankLinux-Docs/server/internal/services/registry"
	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humachi"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/go-co-op/gocron/v2"
	"github.com/joho/godotenv"
)

var Version = "development"

func NewHumaConfig(title, version string) huma.Config {
	schemaPrefix := "#/components/schemas/"
	schemasPath := "/schemas"

	registry := huma.NewMapRegistry(schemaPrefix, huma.DefaultSchemaNamer)

	cfg := huma.Config{
		OpenAPI: &huma.OpenAPI{
			OpenAPI: "3.1.0",
			Info: &huma.Info{
				Title:   title,
				Version: version,
			},
			Components: &huma.Components{
				Schemas: registry,
			},
		},
		OpenAPIPath:   "/openapi",
		DocsPath:      "/docs",
		SchemasPath:   schemasPath,
		Formats:       huma.DefaultFormats,
		DefaultFormat: "application/json",
	}

	return cfg
}

func startAPI(cfg *config.Config) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	signalCh := make(chan os.Signal, 1)
	signal.Notify(signalCh, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-signalCh
		slog.Info("Received shutdown signal", "signal", sig)
		cancel()
	}()

	pluginCache := registry.NewCache(cfg.GithubToken)
	themeCache := registry.NewThemeCache(cfg.GithubToken)

	log.Info("Initializing plugin cache...")
	if err := pluginCache.Initialize(ctx); err != nil {
		log.Fatalf("Failed to initialize plugin cache: %v", err)
	}

	log.Info("Initializing theme cache...")
	if err := themeCache.Initialize(ctx); err != nil {
		log.Fatalf("Failed to initialize theme cache: %v", err)
	}

	srvImpl := &server.Server{
		PluginCache: pluginCache,
		ThemeCache:  themeCache,
	}

	r := chi.NewRouter()

	var allowedOrigins []string
	if cfg.Environment == "development" {
		allowedOrigins = []string{
			"http://localhost:3000",
			"https://danklinux.com",
		}
	} else {
		allowedOrigins = []string{
			"https://danklinux.com",
		}
	}

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/version", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"version": "` + Version + `"}`))
	})

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	r.Group(func(r chi.Router) {
		r.Use(middleware.RealIP)
		r.Use(middleware.Logger)
		r.Use(middleware.RequestID)

		humaConfig := NewHumaConfig("DankLinux Docs API", "1.0.0")
		humaConfig.DocsPath = ""
		api := humachi.New(r, humaConfig)

		r.Get("/docs", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "text/html")
			w.Write([]byte(`<!doctype html>
<html>
	<head>
		<title>API Reference</title>
		<meta charset="utf-8" />
		<meta
			name="viewport"
			content="width=device-width, initial-scale=1" />
	</head>
	<body>
		<script
			id="api-reference"
			data-url="/openapi.json"></script>
		<script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest"></script>
	</body>
</html>`))
		})

		pluginsGroup := huma.NewGroup(api, "/plugins")
		pluginsGroup.UseModifier(func(op *huma.Operation, next func(*huma.Operation)) {
			op.Tags = []string{"Plugins"}
			next(op)
		})
		plugins_handler.RegisterHandlers(srvImpl, pluginsGroup)

		themesGroup := huma.NewGroup(api, "/themes")
		themesGroup.UseModifier(func(op *huma.Operation, next func(*huma.Operation)) {
			op.Tags = []string{"Themes"}
			next(op)
		})
		themes_handler.RegisterHandlers(srvImpl, themesGroup)
	})

	addr := ":" + cfg.Port
	log.Infof("Starting server on %s", addr)

	httpServer := &http.Server{
		Addr:    addr,
		Handler: r,
	}

	scheduler, err := gocron.NewScheduler(gocron.WithLocation(time.UTC))
	if err != nil {
		log.Fatal("Failed to create scheduler", "err", err)
	}

	_, err = scheduler.NewJob(
		gocron.DurationJob(10*time.Minute),
		gocron.NewTask(
			func(ctx context.Context) {
				log.Info("Running scheduled cache refresh")
				if err := pluginCache.Refresh(ctx); err != nil {
					log.Error("Failed to refresh plugin cache", "err", err)
				}
				if err := themeCache.Refresh(ctx); err != nil {
					log.Error("Failed to refresh theme cache", "err", err)
				}
			},
			ctx,
		),
	)
	if err != nil {
		log.Fatal("Failed to create cache refresh job", "err", err)
	}

	scheduler.Start()
	defer func() {
		if err := scheduler.Shutdown(); err != nil {
			log.Error("Scheduler shutdown error", "err", err)
		} else {
			log.Info("Scheduler gracefully stopped")
		}
	}()

	go func() {
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	<-ctx.Done()
	log.Info("Shutting down server...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server shutdown error: %v", err)
	}

	log.Info("Server gracefully stopped")
}

func main() {
	log.Infof("Starting DankLinux Docs API version %s", Version)

	err := godotenv.Load()
	if err != nil {
		log.Warn("Error loading .env file:", err)
	}

	cfg := config.NewConfig()
	startAPI(cfg)
}
