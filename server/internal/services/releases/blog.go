package releases

import (
	"bufio"
	"errors"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
)

const blogBaseURL = "https://danklinux.com/blog/"

var (
	releaseSlugRe = regexp.MustCompile(`^v(\d+)(?:-(\d+))?-release$`)
	datePrefixRe  = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}-`)
)

type blogPost struct {
	Slug        string
	Description string
}

// scanBlog maps "major.minor" to that minor's release post.
func scanBlog(dir string) (map[string]blogPost, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	posts := make(map[string]blogPost)
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		fm, err := readFrontmatter(filepath.Join(dir, e.Name(), "index.mdx"))
		if errors.Is(err, os.ErrNotExist) {
			fm, err = readFrontmatter(filepath.Join(dir, e.Name(), "index.md"))
		}
		if err != nil {
			continue
		}

		// Docusaurus derives the slug from the folder name minus its date when frontmatter omits it.
		slug := fm["slug"]
		if slug == "" {
			slug = datePrefixRe.ReplaceAllString(e.Name(), "")
		}
		m := releaseSlugRe.FindStringSubmatch(slug)
		if m == nil {
			continue
		}
		minor := m[2]
		if minor == "" {
			minor = "0"
		}
		posts[m[1]+"."+minor] = blogPost{Slug: slug, Description: fm["description"]}
	}
	return posts, nil
}

func blogFor(posts map[string]blogPost, version string) (blogPost, bool) {
	core, _, _ := strings.Cut(version, "-")
	parts := strings.SplitN(core, ".", 3)
	if len(parts) < 2 {
		return blogPost{}, false
	}
	post, ok := posts[parts[0]+"."+parts[1]]
	return post, ok
}

func readFrontmatter(path string) (map[string]string, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	sc := bufio.NewScanner(f)
	if !sc.Scan() || strings.TrimSpace(sc.Text()) != "---" {
		return nil, errors.New("no frontmatter")
	}

	fm := make(map[string]string)
	for sc.Scan() {
		line := sc.Text()
		if strings.TrimSpace(line) == "---" {
			return fm, nil
		}
		key, value, ok := strings.Cut(line, ":")
		if !ok || strings.HasPrefix(line, " ") {
			continue
		}
		fm[strings.TrimSpace(key)] = unquoteYAML(strings.TrimSpace(value))
	}
	if err := sc.Err(); err != nil {
		return nil, err
	}
	return nil, errors.New("unterminated frontmatter")
}

func unquoteYAML(v string) string {
	switch {
	case len(v) >= 2 && v[0] == '"' && v[len(v)-1] == '"':
		if s, err := strconv.Unquote(v); err == nil {
			return s
		}
		return v[1 : len(v)-1]
	case len(v) >= 2 && v[0] == '\'' && v[len(v)-1] == '\'':
		return strings.ReplaceAll(v[1:len(v)-1], "''", "'")
	}
	return v
}
