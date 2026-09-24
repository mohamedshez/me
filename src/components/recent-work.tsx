import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FeedStatus } from "./project-feed";
import { getProjectFeed } from "@/lib/github";
import { recentRepositories } from "@/lib/repositories";
import { RepositoryCard } from "./project-card";

export async function RecentWork() {
  const feed = await getProjectFeed();
  const recent = recentRepositories(feed.repositories, new Date(feed.fetchedAt ?? 0));
  return <section className="section site-container" aria-labelledby="recent-title"><div className="section-heading"><div><span className="eyebrow">02 / RECENTLY UPDATED</span><h2 id="recent-title">From my workbench.</h2></div><Link className="text-link" href="/projects">All projects <ArrowRight size={17} /></Link></div><div className="feed-heading"><p>Recent repository activity, straight from GitHub.</p><FeedStatus status={feed.status} /></div>{recent.length ? <div className="project-grid">{recent.map((repo, i) => <RepositoryCard key={repo.id} repository={repo} index={i} />)}</div> : <div className="empty-state"><h3>{feed.status === "unavailable" ? "The work is still here." : "Explore the full collection."}</h3><p>{feed.status === "unavailable" ? "Repository updates couldn’t be loaded just now. You can visit my applications or browse GitHub directly." : "There are no eligible repository updates in the last six months."}</p><a className="text-link" href="https://github.com/mohamedshez" target="_blank" rel="noopener noreferrer">Open GitHub ↗</a></div>}</section>;
}
