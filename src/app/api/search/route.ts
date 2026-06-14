import { NextRequest, NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth/config";
import {
  getFeedData,
  parseFeedFilter,
  parseFeedSort,
  parsePositiveInt,
} from "@/lib/data/articles";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const session = await getServerAuthSession();

  const data = await getFeedData({
    search: searchParams.get("q") ?? undefined,
    categorySlug: searchParams.get("category") ?? undefined,
    filter: parseFeedFilter(searchParams.get("filter") ?? undefined),
    sort: parseFeedSort(searchParams.get("sort") ?? undefined),
    page: parsePositiveInt(searchParams.get("page") ?? undefined),
    userId: session?.user?.id,
  });

  return NextResponse.json(data);
}
