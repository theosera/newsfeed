import { AppShell } from "@/components/layout/app-shell";
import { SourceManager } from "@/components/admin/source-manager";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSourcesPage() {
  const user = await requireAdmin();

  const [categories, sources, popularArticles, recentArticles] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { articles: true, sources: true },
        },
      },
    }),
    prisma.source.findMany({
      orderBy: { createdAt: "desc" },
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

  return (
    <AppShell
      pathname="/admin/sources"
      user={user}
      categories={categories}
      sources={sources}
      popularArticles={popularArticles}
      recentArticles={recentArticles}
    >
      <div className="space-y-4">
        <section className="rounded-2xl border bg-card p-6">
          <h1 className="text-2xl font-semibold">Source Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            RSS ソースの登録、カテゴリ管理、手動取得、取得 ON/OFF をまとめて管理します。
          </p>
        </section>

        <SourceManager initialCategories={categories} initialSources={sources} />
      </div>
    </AppShell>
  );
}
