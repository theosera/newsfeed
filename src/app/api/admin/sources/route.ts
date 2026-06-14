import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { createSourceSlug } from "@/lib/rss/fetcher";
import { sourceSchema } from "@/lib/validators";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const sources = await prisma.source.findMany({
    orderBy: { createdAt: "desc" },
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

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const body = await request.json();
  const parsed = sourceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const source = await prisma.source.create({
    data: {
      name: data.name,
      slug: createSourceSlug(data.name),
      url: data.url,
      websiteUrl: data.websiteUrl || null,
      description: data.description || null,
      categoryId: data.categoryId,
    },
  });

  return NextResponse.json(source, { status: 201 });
}
