import { ArticleCard, type FeedArticle } from "@/components/feed/article-card";

type FeedListProps = {
  articles: FeedArticle[];
  view: "card" | "list" | "newspaper";
  disabledActions?: boolean;
};

export function FeedList({
  articles,
  view,
  disabledActions = false,
}: FeedListProps) {
  if (articles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
        <h2 className="text-lg font-semibold">まだ記事がありません</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          RSS を登録して取得を実行すると、ここに記事が並びます。
        </p>
      </div>
    );
  }

  if (view === "newspaper") {
    return (
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {articles.map((article, index) => (
          <div key={article.id} className={index === 0 ? "md:col-span-2" : undefined}>
            <ArticleCard article={article} disabledActions={disabledActions} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          compact={view === "list"}
          disabledActions={disabledActions}
        />
      ))}
    </div>
  );
}
