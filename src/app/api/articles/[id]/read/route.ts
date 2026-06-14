import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_: Request, context: RouteContext) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  await prisma.articleRead.upsert({
    where: {
      userId_articleId: {
        userId: session.user.id,
        articleId: id,
      },
    },
    update: {
      readAt: new Date(),
    },
    create: {
      userId: session.user.id,
      articleId: id,
    },
  });

  return NextResponse.json({ ok: true });
}
