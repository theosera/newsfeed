import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { createSourceSlug } from "@/lib/rss/fetcher";
import { sourceUpdateSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = sourceUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const source = await prisma.source.update({
    where: { id },
    data: {
      name: data.name,
      slug: createSourceSlug(data.name),
      url: data.url,
      websiteUrl: data.websiteUrl || null,
      description: data.description || null,
      categoryId: data.categoryId,
      enabled: data.enabled ?? true,
    },
  });

  return NextResponse.json(source);
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await context.params;

  await prisma.source.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
