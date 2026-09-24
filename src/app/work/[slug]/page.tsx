import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { applications } from "@/content/portfolio";
import { ExternalLink, KashEnvironments } from "@/components/shared";
import { getRepositoryIndex } from "@/lib/github";
import { formatDate } from "@/lib/format";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const app = applications.find(item => item.slug === slug);
  return app ? { title: app.name, description: app.summary, alternates: { canonical: `/work/${app.slug}` } } : { title: "Project not found" };
}
export default async function AppPage({ params }: Props) {
  const { slug } = await params;
  const app = applications.find(item => item.slug === slug);
  if (!app) notFound();
  const feed = await getRepositoryIndex();
  const repo = app.repository ? feed.byName.get(app.repository) : undefined;
  return <div className="site-container page-content"><Link href="/projects" className="back-link">← All projects</Link><span className="eyebrow">LIVE APPLICATION / {app.category}</span><h1>{app.name}</h1><p className="lede">{repo?.description || app.summary}</p><div className="actions"><ExternalLink className="button primary" href={app.url}>Open {app.name}</ExternalLink>{repo ? <ExternalLink href={repo.url}>View source on GitHub</ExternalLink> : app.repository ? <ExternalLink href={`https://github.com/mohamedshez/${app.repository}`}>View repository</ExternalLink> : <span className="badge">Private source</span>}</div><div className="detail-facts"><div><span>RESPONSIBILITY</span><strong>{app.responsibility}</strong></div><div><span>LIVE ADDRESS</span><strong>{new URL(app.url).hostname}</strong></div><div><span>{repo?.pushedAt ? "LATEST REPOSITORY PUSH" : "PROJECT"}</span><strong>{repo?.pushedAt ? formatDate(repo.pushedAt) : app.category}</strong></div></div><div className="detail-description"><h2>The project.</h2><ul>{app.notes.map(note => <li key={note}>{note}</li>)}</ul></div>{app.technologies.length > 0 && <div className="tech-tags">{app.technologies.map(tech => <span key={tech}>{tech}</span>)}</div>}{app.slug === "kash-lv" && <KashEnvironments />}</div>;
}
