import type { AppProject, Repository } from "./types";

export type DirectoryEntry = {
  id: string;
  name: string;
  description: string;
  href: string;
  website: string | null;
  source: string | null;
  language: string | null;
  private: boolean;
  fork: boolean;
  archived: boolean;
  pushedAt: string | null;
  live: boolean;
  searchText: string;
};
export type DirectoryFilter = "all" | "live" | "source" | "forks" | "archived";
export const DIRECTORY_PAGE_SIZE = 24;

// Only the requested page allocates a slice, capped at 24 references.
export function directoryPage(entries: readonly DirectoryEntry[], page: number) {
  const pages = Math.max(1, Math.ceil(entries.length / DIRECTORY_PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), pages);
  const offset = (currentPage - 1) * DIRECTORY_PAGE_SIZE;
  return { pages, currentPage, offset, visible: entries.slice(offset, offset + DIRECTORY_PAGE_SIZE) };
}

// O(n) construction, O(n) references; average O(1) exact-name lookups.
export function indexRepositories(repositories: readonly Repository[]): ReadonlyMap<string, Repository> {
  const index = new Map<string, Repository>();
  for (const repository of repositories) index.set(repository.name, repository);
  return index;
}

function searchable(entry: Omit<DirectoryEntry, "searchText">, topics: readonly string[]): DirectoryEntry {
  return { ...entry, searchText: `${entry.name} ${entry.description} ${entry.language ?? ""} ${topics.join(" ")}`.toLowerCase() };
}

// Server transformation: O(n + a + s) time and space, where s is text length.
// Only the searchable directory needs this complete, display-ready payload.
export function buildDirectory(repositories: readonly Repository[], applications: readonly AppProject[]): DirectoryEntry[] {
  const byName = indexRepositories(repositories);
  const linked = new Set<string>();
  const entries: DirectoryEntry[] = [];
  for (const app of applications) {
    if (app.repository) linked.add(app.repository);
    const repo = app.repository ? byName.get(app.repository) : undefined;
    entries.push(searchable({
      id: `app:${app.slug}`, name: app.name, description: repo?.description || app.summary,
      href: `/work/${app.slug}`, website: app.url, source: repo?.url ?? null,
      language: repo?.language ?? null, private: !app.repository, fork: false,
      archived: false, pushedAt: repo?.pushedAt ?? null, live: true,
    }, repo?.topics ?? []));
  }
  for (const repo of repositories) {
    if (linked.has(repo.name)) continue;
    entries.push(searchable({
      id: `repo:${repo.id}`, name: repo.name, description: repo.description || "Explore this project on GitHub.",
      href: `/projects/${repo.name}`, website: repo.homepage, source: repo.url,
      language: repo.language, private: false, fork: repo.fork, archived: repo.archived,
      pushedAt: repo.pushedAt, live: false,
    }, repo.topics));
  }
  return entries;
}

// Substring matching requires scanning text. A Map cannot make it O(1).
// Query normalized once; results reuse entries instead of copying objects.
export function filterDirectory(entries: readonly DirectoryEntry[], filter: DirectoryFilter, query: string): readonly DirectoryEntry[] {
  const term = query.trim().toLowerCase();
  if (filter === "all" && !term) return entries;
  return entries.filter(entry => {
    const category = filter === "all" || (filter === "live" && entry.live) ||
      (filter === "source" && entry.source !== null) || (filter === "forks" && entry.fork) ||
      (filter === "archived" && entry.archived);
    return category && (!term || entry.searchText.includes(term));
  });
}
