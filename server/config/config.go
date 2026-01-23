package config

import (
	"os"
)

type Config struct {
	Port        string
	Environment string
	GithubToken string
	KlipyAPIKey string
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

	return &Config{
		Port:        port,
		Environment: env,
		GithubToken: githubToken,
		KlipyAPIKey: klipyAPIKey,
	}
}
