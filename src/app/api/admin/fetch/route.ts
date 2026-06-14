import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/guards";
import { fetchAllEnabledSources, fetchAndLogSource } from "@/lib/rss/fetcher";

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as { sourceId?: string };

  if (body.sourceId) {
    const result = await fetchAndLogSource(body.sourceId);
    return NextResponse.json(result);
  }

  const results = await fetchAllEnabledSources();
  return NextResponse.json(results);
}
