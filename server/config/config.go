package config

import (
	"os"
)

type Config struct {
	Port                   string
	Environment            string
	GithubToken            string
	KlipyAPIKey            string
	PoeditorCallbackSecret string
	DiscordWebhookURL      string
	UploadToken            string
	UploadDir              string
	CacheDir               string
}

func NewConfig() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8337"
	}

	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		env = "development"
	}

	githubToken := os.Getenv("GITHUB_TOKEN")
	klipyAPIKey := os.Getenv("KLIPY_API_KEY")
	poeditorSecret := os.Getenv("POEDITOR_CALLBACK_SECRET")
	discordWebhookURL := os.Getenv("DISCORD_WEBHOOK_URL")
	uploadToken := os.Getenv("UPLOAD_TOKEN")

	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "/data/uploads"
	}

	cacheDir := os.Getenv("CACHE_DIR")

	return &Config{
		Port:                   port,
		Environment:            env,
		GithubToken:            githubToken,
		KlipyAPIKey:            klipyAPIKey,
		PoeditorCallbackSecret: poeditorSecret,
		DiscordWebhookURL:      discordWebhookURL,
		UploadToken:            uploadToken,
		UploadDir:              uploadDir,
		CacheDir:               cacheDir,
	}
}
