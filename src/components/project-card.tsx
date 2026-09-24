import Link from "next/link";
import { ArrowUpRight, ArrowRight, GitFork, Archive, Code2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Repository } from "@/lib/types";

export function RepositoryCard({ repository, index }: { repository: Repository; index?: number }) {
  return <article className="project-card"><div className="card-topline"><span className="mono">{index !== undefined ? String(index + 1).padStart(2, "0") + " / " : ""}{repository.language ?? "Repository"}</span>{repository.fork ? <GitFork size={22} aria-label="Fork" /> : <Code2 size={22} />}</div><h3><Link href={`/projects/${repository.name}`}>{repository.name.replaceAll("-", " ")}</Link></h3><p>{repository.description || "Explore the source and development history on GitHub."}</p><div className="card-badges">{repository.fork && <span><GitFork size={12} />Fork</span>}{repository.archived && <span><Archive size={12} />Archived</span>}</div><div className="card-links"><Link href={`/projects/${repository.name}`}>Details <ArrowRight size={15} /></Link><a href={repository.url} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={15} /></a>{repository.homepage && <a href={repository.homepage} target="_blank" rel="noopener noreferrer">Website <ArrowUpRight size={15} /></a>}</div><time className="card-date" dateTime={repository.pushedAt ?? undefined}>Last push · {formatDate(repository.pushedAt)}</time></article>;
}
