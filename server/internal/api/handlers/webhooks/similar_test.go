package webhooks

import "testing"

const emptyBody = "Body text\n\n" + similarStart + "\n" + similarEnd + "\n\n<!-- dms-plugin-id: worldClockMulti -->"

func TestParseSimilarCommands(t *testing.T) {
	cmds := parseSimilarCommands("/similar WorldClock #530\n/unsimilar #42\nnoise /similarity #99")

	if len(cmds) != 2 {
		t.Fatalf("expected 2 commands, got %d: %+v", len(cmds), cmds)
	}
	if cmds[0].remove || cmds[0].number != 530 {
		t.Fatalf("unexpected first command: %+v", cmds[0])
	}
	if !cmds[1].remove || cmds[1].number != 42 {
		t.Fatalf("unexpected second command: %+v", cmds[1])
	}
}

func TestEditSimilarBlockAddRemove(t *testing.T) {
	added, changed := editSimilarBlock(emptyBody, similarEntry{id: "worldClock", number: 530}, true)
	if !changed {
		t.Fatal("expected add to change body")
	}
	if got := parseSimilarEntries(added); len(got) != 1 || got[0].id != "worldClock" || got[0].number != 530 {
		t.Fatalf("unexpected entries after add: %+v", got)
	}

	if _, changed := editSimilarBlock(added, similarEntry{id: "worldClock", number: 530}, true); changed {
		t.Fatal("re-adding the same entry should be a no-op")
	}

	second, changed := editSimilarBlock(added, similarEntry{id: "foo", number: 12}, true)
	if !changed || len(parseSimilarEntries(second)) != 2 {
		t.Fatalf("expected two entries after second add, got %+v", parseSimilarEntries(second))
	}

	removed, changed := editSimilarBlock(second, similarEntry{id: "worldClock", number: 530}, false)
	if !changed {
		t.Fatal("expected remove to change body")
	}
	got := parseSimilarEntries(removed)
	if len(got) != 1 || got[0].id != "foo" {
		t.Fatalf("unexpected entries after remove: %+v", got)
	}

	if _, changed := editSimilarBlock(emptyBody, similarEntry{id: "foo", number: 12}, false); changed {
		t.Fatal("removing an absent entry should be a no-op")
	}
}

func TestEditSimilarBlockInsertsWhenMissing(t *testing.T) {
	body := "Plain body\n\n<!-- dms-plugin-id: foo -->"

	out, changed := editSimilarBlock(body, similarEntry{id: "bar", number: 7}, true)
	if !changed {
		t.Fatal("expected insert to change body")
	}
	if got := parseSimilarEntries(out); len(got) != 1 || got[0].id != "bar" {
		t.Fatalf("unexpected entries after insert: %+v", got)
	}
}
