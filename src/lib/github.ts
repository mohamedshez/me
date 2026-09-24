import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { CACHE_SECONDS, GITHUB_OWNER, normalizeRepositories } from "./repositories";
import { indexRepositories } from "./directory";
import type { ProjectFeed } from "./types";

export const PROJECT_CACHE_TAG = "public-projects-v1";

const loadRepositories = unstable_cache(async (): Promise<ProjectFeed> => {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "shez-personal-portfolio",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const all: unknown[] = [];
  for (let page = 1; page <= 20; page++) {
    const response = await fetch(`https://api.github.com/users/${GITHUB_OWNER}/repos?type=owner&sort=pushed&direction=desc&per_page=100&page=${page}`, {
      headers, cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Public repository request failed (${response.status})`);
    const data: unknown = await response.json();
    if (!Array.isArray(data)) throw new Error("Invalid public repository response");
    all.push(...data);
    if (data.length < 100) return { repositories: normalizeRepositories(all), fetchedAt: new Date().toISOString(), status: "available" };
  }
  throw new Error("Repository pagination limit exceeded");
}, [PROJECT_CACHE_TAG, GITHUB_OWNER], { revalidate: CACHE_SECONDS, tags: [PROJECT_CACHE_TAG] });

export const getProjectFeed = cache(async (): Promise<ProjectFeed> => {
  try { return await loadRepositories(); }
  catch {
    // No invented snapshot or private API fallback. Approved live apps stay usable.
    return { repositories: [], fetchedAt: null, status: "unavailable" };
  }
});

// One index per server request, shared by metadata and page rendering.
export const getRepositoryIndex = cache(async () => {
  const feed = await getProjectFeed();
  return { status: feed.status, byName: indexRepositories(feed.repositories) };
});
