import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await getServerAuthSession();

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      source: true,
      category: true,
      bookmarks: session?.user?.id
        ? {
            where: {
              userId: session.user.id,
            },
            take: 1,
          }
        : false,
      reads: session?.user?.id
        ? {
            where: {
              userId: session.user.id,
            },
            take: 1,
          }
        : false,
      _count: {
        select: {
          bookmarks: true,
        },
      },
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  const relatedArticles = await prisma.article.findMany({
    where: {
      id: { not: article.id },
      OR: [{ categoryId: article.categoryId }, { sourceId: article.sourceId }],
      status: "PUBLISHED",
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: {
      source: true,
    },
  });

  return NextResponse.json({
    article,
    relatedArticles,
  });
}
