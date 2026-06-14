import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { ArticleActions } from "@/components/feed/article-actions";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatFullDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function toPlainText(value?: string | null) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<\/(p|div|li|h[1-6]|blockquote|tr)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/[^\S\n]+/g, " ")
    .replace(/[^\S\n]*\n[^\S\n]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ArticleDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  const { id } = await params;

  const [article, categories, sources, popularArticles, recentArticles] =
    await Promise.all([
      prisma.article.findUnique({
        where: { id },
        include: {
          source: true,
          category: true,
          reads: user
            ? {
                where: { userId: user.id },
                take: 1,
              }
            : false,
          bookmarks: user
            ? {
                where: { userId: user.id },
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

  if (!article) {
    notFound();
  }

  if (user) {
    await prisma.articleRead.upsert({
      where: {
        userId_articleId: {
          userId: user.id,
          articleId: article.id,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        userId: user.id,
        articleId: article.id,
      },
    });
  }

  const relatedArticles = await prisma.article.findMany({
    where: {
      id: { not: article.id },
      OR: [{ categoryId: article.categoryId }, { sourceId: article.sourceId }],
      status: "PUBLISHED",
    },
    take: 4,
    orderBy: { publishedAt: "desc" },
    include: {
      source: true,
    },
  });

  return (
    <AppShell
      pathname={`/articles/${article.id}`}
      user={user}
      categories={categories}
      sources={sources}
      popularArticles={popularArticles}
      recentArticles={recentArticles}
    >
      <article className="space-y-6">
        <section className="rounded-2xl border bg-card p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link href={`/category/${article.category.slug}`}>{article.category.name}</Link>
            <span>・</span>
            <Link href={`/source/${article.source.slug}`}>{article.source.name}</Link>
            <span>・</span>
            <span>{formatFullDate(article.publishedAt)}</span>
          </div>

          <h1 className="text-3xl font-semibold leading-tight">{article.title}</h1>
          <p className="mt-4 max-w-[68ch] text-base leading-7 text-foreground/80">
            {article.summary}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <ArticleActions
              articleId={article.id}
              isBookmarked={Boolean(article.bookmarks?.length)}
              isRead={Boolean(user)}
              disabled={!user}
            />
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              元記事で読む
              <ExternalLink className="size-4" />
            </a>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">本文 / 抜粋</h2>
          <div className="mt-4 max-w-[68ch] space-y-4 text-[15px] leading-8 text-foreground/90">
            {(toPlainText(article.content) || article.summary)
              .split(/\n{2,}/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index} className="whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            許諾のない全文転載を避けるため、表示内容は RSS に含まれる本文または抜粋に限ります。
          </p>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">関連記事</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {relatedArticles.map((relatedArticle) => (
              <Link
                key={relatedArticle.id}
                href={`/articles/${relatedArticle.id}`}
                className="rounded-xl border p-4 transition hover:border-primary/30 hover:bg-muted/40"
              >
                <p className="text-sm font-medium">{relatedArticle.title}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {relatedArticle.source.name}
                </p>
              </Link>
            ))}
            {relatedArticles.length === 0 ? (
              <p className="text-sm text-muted-foreground">関連記事はまだありません。</p>
            ) : null}
          </div>
        </section>
      </article>
    </AppShell>
  );
}
