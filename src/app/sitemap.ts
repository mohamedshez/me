import type { MetadataRoute } from "next";
import { getProjectFeed } from "@/lib/github";
import { applications } from "@/content/portfolio";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.SITE_URL || "https://www.shez.app").replace(/\/$/, "");
  const feed = await getProjectFeed();
  return [
    ...["", "/about", "/projects", "/sitemap"].map(path => ({ url: base + path, changeFrequency: "weekly" as const })),
    ...applications.map(app => ({ url: `${base}/work/${app.slug}`, changeFrequency: "weekly" as const })),
    ...feed.repositories.map(repo => ({ url: `${base}/projects/${repo.name}`, ...(repo.pushedAt ? { lastModified: repo.pushedAt } : {}), changeFrequency: "daily" as const })),
  ];
}
