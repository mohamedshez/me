import test from "node:test";
import assert from "node:assert/strict";
import { buildDirectory, filterDirectory, indexRepositories, directoryPage, DIRECTORY_PAGE_SIZE } from "../src/lib/directory";
import { recentRepositories } from "../src/lib/repositories";
import type { Repository, AppProject } from "../src/lib/types";

const makeRepo = (id: number, extra: Partial<Repository> = {}): Repository => ({
  id, name: `repo-${id}`, description: `Application ${id}`, url: `https://github.com/mohamedshez/repo-${id}`,
  homepage: null, language: "TypeScript", topics: ["maps"], pushedAt: "2026-09-01T00:00:00Z",
  stars: 0, fork: false, archived: false, ...extra,
});
const live: AppProject = { slug: "live", name: "Live product", category: "App", summary: "Fallback", url: "https://example.com", repository: "repo-42", technologies: [], responsibility: "Maintainer", notes: [] };

test("large directory joins known apps once, keeps every other repository, and namespaces keys", () => {
  const repositories = Array.from({ length: 600 }, (_, id) => makeRepo(id));
  const privateApp = { ...live, slug: "private", repository: null };
  const entries = buildDirectory(repositories, [live, privateApp]);
  assert.equal(entries.length, 601);
  assert.equal(new Set(entries.map(entry => entry.id)).size, 601);
  assert.equal(entries[0].source, repositories[42].url);
  assert.equal(entries[0].description, repositories[42].description);
  assert.equal(entries.filter(entry => entry.href === "/projects/repo-42").length, 0);
  assert.equal(entries[1].source, null);
  assert.equal(entries[1].private, true);
  const index = indexRepositories(repositories);
  assert.equal(index.get("repo-599"), repositories[599]);
  assert.equal(index.get("missing"), undefined);
  assert.equal(DIRECTORY_PAGE_SIZE, 24);
});

test("search matches app names and repository text, language and topics without mutating entries", () => {
  const entries = buildDirectory([makeRepo(42), makeRepo(1, { fork: true }), makeRepo(2, { archived: true })], [live]);
  assert.equal(filterDirectory(entries, "all", ""), entries);
  assert.equal(filterDirectory(entries, "all", "  TYPESCRIPT  ").length, 3);
  assert.equal(filterDirectory(entries, "all", "maps").length, 3);
  assert.equal(filterDirectory(entries, "all", "application 42")[0], entries[0]);
  assert.equal(filterDirectory(entries, "live", "Live product").length, 1);
  assert.equal(filterDirectory(entries, "forks", "")[0].name, "repo-1");
  assert.equal(filterDirectory(entries, "archived", "")[0].name, "repo-2");
  assert.equal(filterDirectory(entries, "source", "").length, 3);
  assert.equal(filterDirectory(entries, "all", "unmatched query").length, 0);
  assert.equal(entries.length, 3);
});

test("pagination exposes every project exactly once and clamps the page after a daily inventory change", () => {
  const entries = buildDirectory(Array.from({ length: 601 }, (_, id) => makeRepo(id)), []);
  const visited: string[] = [];
  const { pages } = directoryPage(entries, 1);
  for (let page = 1; page <= pages; page++) {
    const result = directoryPage(entries, page);
    assert.ok(result.visible.length <= 24);
    visited.push(...result.visible.map(entry => entry.id));
  }
  assert.deepEqual(visited, entries.map(entry => entry.id));
  const narrowed = directoryPage(entries.slice(0, 2), pages);
  assert.equal(narrowed.currentPage, 1);
  assert.equal(narrowed.visible.length, 2);
  assert.equal(directoryPage([], 3).visible.length, 0);
});

test("top-three selection handles unsorted input, skips ineligible records and preserves the source", () => {
  const repositories = [
    makeRepo(1, { pushedAt: "2026-09-05T00:00:00Z" }), makeRepo(2, { pushedAt: "2026-09-22T00:00:00Z" }),
    makeRepo(3, { pushedAt: "2026-09-23T00:00:00Z", fork: true }), makeRepo(4, { pushedAt: "2026-09-19T00:00:00Z" }),
    makeRepo(5, { pushedAt: "2026-09-20T00:00:00Z" }), makeRepo(6, { pushedAt: null }),
    makeRepo(7, { pushedAt: "2026-09-24T00:00:00Z", archived: true }), makeRepo(8, { pushedAt: "2020-01-01T00:00:00Z" }),
  ];
  const before = [...repositories];
  assert.deepEqual(recentRepositories(repositories, new Date("2026-09-24")).map(repo => repo.id), [2, 5, 4]);
  assert.deepEqual(repositories, before);
});
