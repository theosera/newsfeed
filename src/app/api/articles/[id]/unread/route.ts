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

  await prisma.articleRead.deleteMany({
    where: {
      userId: session.user.id,
      articleId: id,
    },
  });

  return NextResponse.json({ ok: true });
}
