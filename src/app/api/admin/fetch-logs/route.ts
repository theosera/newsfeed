import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const logs = await prisma.feedFetchLog.findMany({
    orderBy: { fetchedAt: "desc" },
    take: 100,
    include: {
      source: true,
    },
  });

  return NextResponse.json(logs);
}
