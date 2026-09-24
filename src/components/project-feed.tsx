import type { ProjectFeed } from "@/lib/types";

export function FeedStatus({ status }: { status: ProjectFeed["status"] }) {
  return <span className="feed-status" role="status">{status === "available" ? "GitHub connected · updated daily" : "GitHub updates are temporarily unavailable. Live app links remain available."}</span>;
}
