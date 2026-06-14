/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { ArticleActions } from "@/components/feed/article-actions";
import { formatRelativeDate, truncate } from "@/lib/format";
import { cn } from "@/lib/utils";

export type FeedArticle = {
  id: string;
  title: string;
  summary: string;
  thumbnailUrl: string | null;
  publishedAt: Date;
  url: string;
  source: {
    name: string;
    slug: string;
  };
  category: {
    name: string;
    slug: string;
  };
  reads?: Array<{ id: string }>;
  bookmarks?: Array<{ id: string }>;
  _count: {
    bookmarks: number;
  };
};

type ArticleCardProps = {
  article: FeedArticle;
  compact?: boolean;
  disabledActions?: boolean;
};

export function ArticleCard({
  article,
  compact = false,
  disabledActions = false,
}: ArticleCardProps) {
  const isRead = Boolean(article.reads?.length);
  const isBookmarked = Boolean(article.bookmarks?.length);

  return (
    <article
      className={cn(
        "rounded-2xl border bg-card p-4 shadow-sm transition hover:border-primary/30",
        !compact && !isRead && "ring-1 ring-primary/10",
        compact && "p-3",
      )}
    >
      <div className="flex gap-4">
        {article.thumbnailUrl ? (
          <img
            src={article.thumbnailUrl}
            alt={`${article.title} のサムネイル`}
            className={cn(
              "rounded-xl object-cover",
              compact ? "hidden h-20 w-28 sm:block" : "h-28 w-36",
            )}
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Link href={`/category/${article.category.slug}`} className="rounded-full bg-muted px-2 py-1">
              {article.category.name}
            </Link>
            <Link href={`/source/${article.source.slug}`}>{article.source.name}</Link>
            <span>{formatRelativeDate(article.publishedAt)}</span>
            {!isRead ? <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">未読</span> : null}
          </div>

          <Link href={`/articles/${article.id}`} className="block">
            <h2 className="text-lg font-semibold leading-7">{article.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {truncate(article.summary, compact ? 120 : 180)}
            </p>
          </Link>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <ArticleActions
              articleId={article.id}
              isBookmarked={isBookmarked}
              isRead={isRead}
              disabled={disabledActions}
            />

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{article._count.bookmarks} saves</span>
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                元記事
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
