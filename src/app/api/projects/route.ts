import { NextResponse } from "next/server";
import { getProjectFeed } from "@/lib/github";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const feed = await getProjectFeed();
  return NextResponse.json(feed, { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
}
