import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import { categorySchema } from "@/lib/validators";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          articles: true,
          sources: true,
        },
      },
    },
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const body = await request.json();
  const parsed = categorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: slugify(parsed.data.name),
      description: parsed.data.description || null,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
