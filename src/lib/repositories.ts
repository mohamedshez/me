import type { Repository } from "./types";

export const GITHUB_OWNER = "mohamedshez";
export const CACHE_SECONDS = 86400;
export const NEW_PROJECT_DAYS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;
// The portfolio itself; other repositories that point here have no website of their own.
const PORTFOLIO_HOSTS = new Set(["shez.app", "www.shez.app"]);

// Used exclusively on the server before any external data reaches HTML/JSON.
// Do not import this policy module into client components.
const excludedAffiliations = ["diaceutics", "dxrx", "the diagnostic network"];
function comparable(value: string): string {
  return value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]/g, "");
}
export function isExcluded(value: unknown): boolean {
  const normalized = comparable(typeof value === "string" ? value : JSON.stringify(value ?? ""));
  return excludedAffiliations.some(term => normalized.includes(comparable(term)));
}
export function safePublicUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim() || isExcluded(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || isExcluded(decodeURIComponent(url.href))) return null;
    const host = url.hostname.toLowerCase();
    if (!host.includes(".") || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || /^[\d.]+$/.test(host) || host.includes(":")) return null;
    return url.href;
  } catch { return null; }
}

type RawRepo = Record<string, unknown>;
function isoDate(value: unknown): string | null {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
}
export function normalizeRepositories(input: unknown): Repository[] {
  if (!Array.isArray(input)) throw new Error("Invalid repository response");
  const unique = new Map<number, Repository>();
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const raw = item as RawRepo;
    const owner = raw.owner as { login?: string } | undefined;
    // Public owner-only ingestion. Never infer that an accessible repo is public.
    if (raw.private !== false || raw.visibility !== "public" || owner?.login?.toLowerCase() !== GITHUB_OWNER) continue;
    if (typeof raw.id !== "number" || typeof raw.name !== "string" || !/^[\w.-]+$/.test(raw.name)) continue;
    const topics = Array.isArray(raw.topics) ? raw.topics.filter((x): x is string => typeof x === "string") : [];
    if (topics.includes("portfolio-hide")) continue;
    const description = typeof raw.description === "string" ? raw.description : "";
    const language = typeof raw.language === "string" ? raw.language : null;
    const displayed = [raw.name, description, language, topics, raw.homepage];
    if (isExcluded(displayed)) continue;
    const publicHomepage = raw.fork === true ? null : safePublicUrl(raw.homepage);
    const homepage = publicHomepage && raw.name !== "me" && PORTFOLIO_HOSTS.has(new URL(publicHomepage).hostname) ? null : publicHomepage;
    const pushedAt = isoDate(raw.pushed_at);
    unique.set(raw.id, {
      id: raw.id, name: raw.name, description: description.replace(/\s+/g, " ").trim().slice(0, 500),
      url: `https://github.com/${GITHUB_OWNER}/${raw.name}`,
      homepage, language, topics: topics.slice(0, 12), pushedAt, createdAt: isoDate(raw.created_at),
      stars: typeof raw.stargazers_count === "number" ? Math.max(0, Math.floor(raw.stargazers_count)) : 0,
      fork: raw.fork === true, archived: raw.archived === true,
    });
  }
  return [...unique.values()].sort((a, b) => (b.pushedAt ?? "").localeCompare(a.pushedAt ?? "") || a.name.localeCompare(b.name));
}

function highlightable(repo: Repository): boolean {
  return !repo.fork && !repo.archived && repo.name !== "me";
}

// Fixed-size top-k selection by an ISO date: O(n·k) time with k = 3, O(k) extra space, no full sort.
// Accepts unsorted input; retained values are references to normalized records.
function newestBy(repositories: readonly Repository[], date: (repo: Repository) => string | null, cutoff: number, skip?: ReadonlySet<number>, limit = 3): Repository[] {
  const selected: Repository[] = [];
  for (const repo of repositories) {
    const value = date(repo);
    if (!highlightable(repo) || !value || Date.parse(value) < cutoff || skip?.has(repo.id)) continue;
    let position = 0;
    while (position < selected.length && (date(selected[position]) ?? "") >= value) position++;
    if (position >= limit) continue;
    selected.splice(position, 0, repo);
    if (selected.length > limit) selected.pop();
  }
  return selected;
}

/** True for an owned, active repository created within the last NEW_PROJECT_DAYS. O(1). */
export function isNewRepository(repo: Repository, now = new Date()): boolean {
  return highlightable(repo) && !!repo.createdAt && Date.parse(repo.createdAt) >= now.getTime() - NEW_PROJECT_DAYS * DAY_MS;
}

/** Up to three newest repositories created within the last NEW_PROJECT_DAYS. */
export function newRepositories(repositories: readonly Repository[], now = new Date()): Repository[] {
  return newestBy(repositories, repo => repo.createdAt, now.getTime() - NEW_PROJECT_DAYS * DAY_MS);
}

/** Up to three most recently pushed repositories from the last 180 days, minus any already highlighted. */
export function recentRepositories(repositories: readonly Repository[], now = new Date(), skip?: ReadonlySet<number>): Repository[] {
  return newestBy(repositories, repo => repo.pushedAt, now.getTime() - 180 * DAY_MS, skip);
}
