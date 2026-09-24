import type { Repository } from "./types";

export const GITHUB_OWNER = "mohamedshez";
export const CACHE_SECONDS = 86400;

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
    const homepage = raw.fork === true ? null : safePublicUrl(raw.homepage);
    const pushedAt = typeof raw.pushed_at === "string" && Number.isFinite(Date.parse(raw.pushed_at)) ? new Date(raw.pushed_at).toISOString() : null;
    unique.set(raw.id, {
      id: raw.id, name: raw.name, description: description.replace(/\s+/g, " ").trim().slice(0, 500),
      url: `https://github.com/${GITHUB_OWNER}/${raw.name}`,
      homepage, language, topics: topics.slice(0, 12), pushedAt,
      stars: typeof raw.stargazers_count === "number" ? Math.max(0, Math.floor(raw.stargazers_count)) : 0,
      fork: raw.fork === true, archived: raw.archived === true,
    });
  }
  return [...unique.values()].sort((a, b) => (b.pushedAt ?? "").localeCompare(a.pushedAt ?? "") || a.name.localeCompare(b.name));
}

export function recentRepositories(repositories: Repository[], now = new Date()): Repository[] {
  const cutoff = now.getTime() - 180 * 24 * 60 * 60 * 1000;
  // Fixed-size top-three selection: O(n) time, O(1) extra space, no full sort.
  // Accepts unsorted input; retained values are references to normalized records.
  const recent: Repository[] = [];
  for (const repo of repositories) {
    if (repo.fork || repo.archived || repo.name === "me" || !repo.pushedAt || Date.parse(repo.pushedAt) < cutoff) continue;
    let position = 0;
    while (position < recent.length && (recent[position].pushedAt ?? "") >= repo.pushedAt) position++;
    if (position >= 3) continue;
    recent.splice(position, 0, repo);
    if (recent.length > 3) recent.pop();
  }
  return recent;
}
