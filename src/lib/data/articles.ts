import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type FeedViewMode = "card" | "list" | "newspaper";
export type FeedSortMode = "newest" | "oldest" | "popular";
export type FeedFilterMode = "all" | "unread" | "saved";

export type FeedQuery = {
  categorySlug?: string;
  sourceSlug?: string;
  search?: string;
  filter?: FeedFilterMode;
  sort?: FeedSortMode;
  page?: number;
  take?: number;
  userId?: string;
  bookmarkOnly?: boolean;
};

export function parsePositiveInt(value?: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function parseFeedView(value?: string): FeedViewMode {
  if (value === "list" || value === "newspaper") {
    return value;
  }

  return "card";
}

export function parseFeedSort(value?: string): FeedSortMode {
  if (value === "oldest" || value === "popular") {
    return value;
  }

  return "newest";
}

export function parseFeedFilter(value?: string): FeedFilterMode {
  if (value === "unread" || value === "saved") {
    return value;
  }

  return "all";
}

export function buildQueryString(
  current: Record<string, string | undefined>,
  updates: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries({ ...current, ...updates })) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getFeedData(query: FeedQuery) {
  const page = query.page ?? 1;
  const take = query.take ?? 20;
  const skip = (page - 1) * take;
  const sort = query.sort ?? "newest";
  const filter = query.filter ?? "all";

  const articleWhere: Prisma.ArticleWhereInput = {
    status: "PUBLISHED",
    ...(query.categorySlug
      ? { category: { slug: query.categorySlug } }
      : {}),
    ...(query.sourceSlug ? { source: { slug: query.sourceSlug } } : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" } },
            { summary: { contains: query.search, mode: "insensitive" } },
            { source: { name: { contains: query.search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  if (query.bookmarkOnly && query.userId) {
    articleWhere.bookmarks = {
      some: {
        userId: query.userId,
      },
    };
  }

  if (filter === "saved" && query.userId) {
    articleWhere.bookmarks = {
      some: {
        userId: query.userId,
      },
    };
  }

  if (filter === "unread" && query.userId) {
    articleWhere.reads = {
      none: {
        userId: query.userId,
      },
    };
  }

  const orderBy: Prisma.ArticleOrderByWithRelationInput[] =
    sort === "popular"
      ? [{ bookmarks: { _count: "desc" } }, { publishedAt: "desc" }]
      : [{ publishedAt: sort === "oldest" ? "asc" : "desc" }];

  const [articles, totalCount, categories, sources, popularArticles, recentArticles] =
    await Promise.all([
      prisma.article.findMany({
        where: articleWhere,
        orderBy,
        skip,
        take,
        include: {
          source: true,
          category: true,
          reads: query.userId
            ? {
                where: { userId: query.userId },
                take: 1,
              }
            : false,
          bookmarks: query.userId
            ? {
                where: { userId: query.userId },
                take: 1,
              }
            : false,
          _count: {
            select: {
              bookmarks: true,
            },
          },
        },
      }),
      prisma.article.count({ where: articleWhere }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { articles: true, sources: true },
          },
        },
      }),
      prisma.source.findMany({
        where: { enabled: true },
        orderBy: { name: "asc" },
        include: {
          category: true,
          _count: {
            select: { articles: true },
          },
        },
      }),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ bookmarks: { _count: "desc" } }, { publishedAt: "desc" }],
        take: 5,
        include: { source: true },
      }),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 5,
        include: { source: true },
      }),
    ]);

  return {
    articles,
    categories,
    sources,
    popularArticles,
    recentArticles,
    totalCount,
    page,
    totalPages: Math.max(1, Math.ceil(totalCount / take)),
  };
}
