import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import { categorySchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = categorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: slugify(parsed.data.name),
      description: parsed.data.description || null,
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  await prisma.category.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
