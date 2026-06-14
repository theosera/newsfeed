import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET() {
  const sources = await prisma.source.findMany({
    orderBy: { name: "asc" },
    include: {
      category: true,
      _count: {
        select: {
          articles: true,
        },
      },
    },
  });

  return NextResponse.json(sources);
}
