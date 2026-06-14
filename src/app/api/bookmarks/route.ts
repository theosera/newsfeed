import { NextRequest, NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

async function getArticleId(request: NextRequest) {
  const body = (await request.json()) as { articleId?: string };
  return body.articleId;
}

export async function POST(request: NextRequest) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articleId = await getArticleId(request);

  if (!articleId) {
    return NextResponse.json({ error: "articleId is required." }, { status: 400 });
  }

  await prisma.bookmark.upsert({
    where: {
      userId_articleId: {
        userId: session.user.id,
        articleId,
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      articleId,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articleId = await getArticleId(request);

  if (!articleId) {
    return NextResponse.json({ error: "articleId is required." }, { status: 400 });
  }

  await prisma.bookmark.deleteMany({
    where: {
      userId: session.user.id,
      articleId,
    },
  });

  return NextResponse.json({ ok: true });
}
