import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET() {
  const logs = await prisma.feedFetchLog.findMany({
    orderBy: { fetchedAt: "desc" },
    take: 100,
    include: {
      source: true,
    },
  });

  return NextResponse.json(logs);
}
