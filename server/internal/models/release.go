package models

import "time"

type ReleaseCounts struct {
	Breaking int `json:"breaking"`
	Features int `json:"features"`
	Fixes    int `json:"fixes"`
	Other    int `json:"other"`
}

type Release struct {
	Tag         string        `json:"tag"`
	Version     string        `json:"version"`
	Codename    string        `json:"codename,omitempty"`
	Prerelease  bool          `json:"prerelease"`
	PublishedAt time.Time     `json:"publishedAt"`
	URL         string        `json:"url"`
	BlogURL     string        `json:"blogUrl,omitempty"`
	Summary     string        `json:"summary,omitempty"`
	Counts      ReleaseCounts `json:"counts"`
	Highlights  []string      `json:"highlights"`
}

type MasterInfo struct {
	SHA         string    `json:"sha"`
	CommitCount int       `json:"commitCount"`
	Date        time.Time `json:"date"`
}

type ReleasesFeed struct {
	Latest   *Release    `json:"latest"`
	Releases []Release   `json:"releases"`
	Master   *MasterInfo `json:"master"`
}
