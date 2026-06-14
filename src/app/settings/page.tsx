import { AppShell } from "@/components/layout/app-shell";
import { SettingsForm } from "@/components/settings/settings-form";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();

  const [settings, categories, sources, popularArticles, recentArticles] =
    await Promise.all([
      prisma.userSetting.findUnique({
        where: { userId: user.id },
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

  return (
    <AppShell
      pathname="/settings"
      user={user}
      categories={categories}
      sources={sources}
      popularArticles={popularArticles}
      recentArticles={recentArticles}
    >
      <div className="space-y-4">
        <section className="rounded-2xl border bg-card p-6">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            テーマと既定レイアウトを保存できます。
          </p>
        </section>

        <SettingsForm
          initialTheme={settings?.theme ?? "SYSTEM"}
          initialLayout={settings?.layout ?? "CARD"}
          initialCompactMode={settings?.compactMode ?? false}
        />
      </div>
    </AppShell>
  );
}
