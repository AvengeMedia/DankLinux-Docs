package releases

import (
	"os"
	"path/filepath"
	"testing"
)

func writePost(t *testing.T, dir, name, frontmatter string) {
	t.Helper()
	path := filepath.Join(dir, name, "index.mdx")
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte("---\n"+frontmatter+"---\n\nimport x from './x';\n"), 0o644); err != nil {
		t.Fatal(err)
	}
}

func TestBlogJoin(t *testing.T) {
	dir := t.TempDir()
	writePost(t, dir, "2026-09-03-v1-6-release",
		"title: \"DMS 1.6 \\\"Marble Tabby\\\" Is Here\"\ndescription: Dank Island: and more.\nslug: v1-6-release\n")
	writePost(t, dir, "2025-12-10-v1-release",
		"title: DMS 1.0\ndescription: \"DMS 1.0 is here!\"\nslug: v1-release\n")
	writePost(t, dir, "2026-10-01-v1-7-release",
		"description: 'It''s here'\n")
	writePost(t, dir, "2025-12-18-desktop-widgets",
		"description: A sneak peek\nslug: desktop-widgets-1-2\n")

	posts, err := scanBlog(dir)
	if err != nil {
		t.Fatal(err)
	}

	tests := []struct {
		version  string
		slug     string
		summary  string
		wantPost bool
	}{
		{"1.6.2", "v1-6-release", "Dank Island: and more.", true},
		{"1.6.0", "v1-6-release", "Dank Island: and more.", true},
		{"1.0.3", "v1-release", "DMS 1.0 is here!", true},
		{"1.7.0-beta.1", "v1-7-release", "It's here", true},
		{"1.2.0", "", "", false},
		{"1.3.1", "", "", false},
	}
	for _, tt := range tests {
		post, ok := blogFor(posts, tt.version)
		if ok != tt.wantPost || post.Slug != tt.slug || post.Description != tt.summary {
			t.Errorf("blogFor(%q) = %+v, %v; want slug %q summary %q, %v", tt.version, post, ok, tt.slug, tt.summary, tt.wantPost)
		}
	}
}
