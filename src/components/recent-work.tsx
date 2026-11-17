import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FeedStatus } from "./project-feed";
import { getProjectFeed } from "@/lib/github";
import { newRepositories, recentRepositories } from "@/lib/repositories";
import { RepositoryCard } from "./project-card";

export async function RecentWork() {
  const feed = await getProjectFeed();
  const now = new Date(feed.fetchedAt ?? 0);
  // Both selections are O(n) passes over the cached feed; the skip set holds at most three ids.
  const added = newRepositories(feed.repositories, now);
  const recent = recentRepositories(feed.repositories, now, new Set(added.map(repo => repo.id)));
  return <section className="section site-container" aria-labelledby="recent-title"><div className="section-heading"><div><span className="eyebrow">{added.length ? "02 / NEW & RECENTLY UPDATED" : "02 / RECENTLY UPDATED"}</span><h2 id="recent-title">From my workbench.</h2></div><Link className="text-link" href="/projects">All projects <ArrowRight size={17} /></Link></div>
    {added.length > 0 && <div className="just-added"><div className="feed-heading"><h3 className="eyebrow">Just added</h3><p>New projects I’ve started recently.</p></div><div className="project-grid">{added.map((repo, i) => <RepositoryCard key={repo.id} repository={repo} index={i} isNew />)}</div></div>}
    <div className="feed-heading"><p>{added.length ? "Recently updated, straight from GitHub." : "Recent repository activity, straight from GitHub."}</p><FeedStatus status={feed.status} /></div>{recent.length ? <div className="project-grid">{recent.map((repo, i) => <RepositoryCard key={repo.id} repository={repo} index={i} />)}</div> : <div className="empty-state"><h3>{feed.status === "unavailable" ? "The work is still here." : "Explore the full collection."}</h3><p>{feed.status === "unavailable" ? "Repository updates couldn’t be loaded just now. You can visit my applications or browse GitHub directly." : "There are no eligible repository updates in the last six months."}</p><a className="text-link" href="https://github.com/mohamedshez" target="_blank" rel="noopener noreferrer">Open GitHub ↗</a></div>}</section>;
}
