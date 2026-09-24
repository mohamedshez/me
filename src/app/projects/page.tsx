import { getProjectFeed } from "@/lib/github";
import { buildDirectory } from "@/lib/directory";
import { applications } from "@/content/portfolio";
import type { Metadata } from "next";
import { ProjectDirectory } from "@/components/project-directory";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Projects", description: "Explore Mohamed Shez’s live applications and automatically updated public project directory.", alternates: { canonical: "/projects" } };
export default async function ProjectsPage() {
  const feed = await getProjectFeed();
  const entries = buildDirectory(feed.repositories, applications);
  return <div className="site-container page-content"><span className="eyebrow">THE COMPLETE INDEX</span><h1>All the moving parts.</h1><p className="lede">Live applications, public repositories, and earlier experiments. Everything has a place; recent work gets the spotlight.</p><ProjectDirectory entries={entries} status={feed.status} /></div>;
}
