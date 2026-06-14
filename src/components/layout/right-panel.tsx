import Link from "next/link";

import { formatRelativeDate, truncate } from "@/lib/format";

type ArticleSummary = {
  id: string;
  title: string;
  publishedAt: Date;
  source: {
    name: string;
  };
};

type RightPanelProps = {
  popularArticles: ArticleSummary[];
  recentArticles: ArticleSummary[];
};

function ArticleList({
  title,
  items,
}: {
  title: string;
  items: ArticleSummary[];
}) {
  return (
    <section className="rounded-2xl border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">まだ記事がありません。</p>
        ) : null}
        {items.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.id}`}
            className="block rounded-lg border border-transparent px-2 py-1 transition hover:border-border hover:bg-muted/50"
          >
            <p className="text-sm font-medium leading-5">{truncate(article.title, 72)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {article.source.name} ・ {formatRelativeDate(article.publishedAt)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function RightPanel({ popularArticles, recentArticles }: RightPanelProps) {
  return (
    <aside className="hidden space-y-4 xl:block">
      <ArticleList title="Popular" items={popularArticles} />
      <ArticleList title="Recent" items={recentArticles} />
    </aside>
  );
}
