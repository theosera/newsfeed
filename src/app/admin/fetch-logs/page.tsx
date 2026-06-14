import { AppShell } from "@/components/layout/app-shell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FetchLogsPage() {
  const user = await requireAdmin();

  const [categories, sources, popularArticles, recentArticles, logs] =
    await Promise.all([
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
      prisma.feedFetchLog.findMany({
        orderBy: { fetchedAt: "desc" },
        take: 100,
        include: { source: true },
      }),
    ]);

  return (
    <AppShell
      pathname="/admin/fetch-logs"
      user={user}
      categories={categories}
      sources={sources}
      popularArticles={popularArticles}
      recentArticles={recentArticles}
    >
      <div className="space-y-4">
        <section className="rounded-2xl border bg-card p-6">
          <h1 className="text-2xl font-semibold">Fetch Logs</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            RSS 取得の成功・失敗と件数を確認できます。
          </p>
        </section>

        <section className="overflow-hidden rounded-2xl border bg-card">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">時刻</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">結果</th>
                  <th className="px-4 py-3">取得</th>
                  <th className="px-4 py-3">取り込み</th>
                  <th className="px-4 py-3">重複</th>
                  <th className="px-4 py-3">エラー</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t">
                    <td className="px-4 py-3">
                      {new Date(log.fetchedAt).toLocaleString("ja-JP")}
                    </td>
                    <td className="px-4 py-3">{log.source.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          log.success ? "text-emerald-600" : "text-destructive"
                        }
                      >
                        {log.success ? "Success" : "Error"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{log.fetchedCount}</td>
                    <td className="px-4 py-3">{log.importedCount}</td>
                    <td className="px-4 py-3">{log.skippedCount}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {log.errorMessage ?? "-"}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={7}>
                      まだ取得ログはありません。
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
