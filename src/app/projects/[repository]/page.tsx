import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getRepositoryIndex } from "@/lib/github";
import { formatDate } from "@/lib/format";
import { ExternalLink } from "@/components/shared";
import { applications } from "@/content/portfolio";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ repository: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { repository } = await params;
  const feed = await getRepositoryIndex();
  const repo = feed.byName.get(repository);
  return repo ? { title: repo.name, description: repo.description || `Explore ${repo.name}, a public repository by Mohamed Shez.`, alternates: { canonical: `/projects/${repo.name}` } } : { title: "Project unavailable" };
}
export default async function RepositoryPage({ params }: Props) {
  const { repository } = await params;
  const feed = await getRepositoryIndex();
  const repo = feed.byName.get(repository);
  if (!repo) {
    if (feed.status === "unavailable") return <div className="site-container page-content"><span className="eyebrow">PROJECTS</span><h1>We couldn’t load that project.</h1><p className="lede">GitHub is temporarily unavailable. Please try again shortly, or explore the live applications.</p><Link href="/projects" className="button">Back to projects</Link></div>;
    notFound();
  }
  const app = applications.find(item => item.repository === repo.name);
  return <div className="site-container page-content"><Link href="/projects" className="back-link">← All projects</Link><span className="eyebrow">PUBLIC REPOSITORY / {repo.fork ? "FORK" : repo.archived ? "ARCHIVED" : "SOURCE AVAILABLE"}</span><h1 className="repo-title">{repo.name.replaceAll("-", " ")}</h1><p className="lede">{repo.description || "Explore the implementation, README, and project history in this public repository."}</p><div className="actions"><ExternalLink className="button primary" href={repo.url}>View on GitHub</ExternalLink>{(app?.url || repo.homepage) && <ExternalLink href={app?.url || repo.homepage!}>{app ? "Open application" : "Project website"}</ExternalLink>}{app && <Link href={`/work/${app.slug}`} className="text-link">Project overview →</Link>}</div><div className="detail-facts"><div><span>PRIMARY LANGUAGE</span><strong>{repo.language || "Not specified"}</strong></div><div><span>LAST REPOSITORY PUSH</span><strong>{formatDate(repo.pushedAt)}</strong></div><div><span>REPOSITORY TYPE</span><strong>{repo.fork ? "Fork of an upstream project" : repo.archived ? "Archived repository" : "Public repository"}</strong></div></div>{repo.fork && <p className="attribution-note">This is a fork of an upstream project. The GitHub repository identifies the original source and its history.</p>}{app?.slug === "osint" && <p className="attribution-note">This project builds on an upstream foundation. See the repository README for credits and implementation details.</p>}<div className="tech-tags">{repo.topics.map(topic => <span key={topic}>{topic}</span>)}</div></div>;
}
