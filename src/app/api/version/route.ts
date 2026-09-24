import { NextResponse } from "next/server";
import { buildInfo } from "@/lib/build-info";

export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json(buildInfo, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}
