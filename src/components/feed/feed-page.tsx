import { AppShell } from "@/components/layout/app-shell";
import { FeedControls } from "@/components/feed/feed-controls";
import { FeedList } from "@/components/feed/feed-list";
import { FeedPagination } from "@/components/feed/feed-pagination";
import {
  getFeedData,
  parseFeedFilter,
  parseFeedSort,
  parseFeedView,
  parsePositiveInt,
} from "@/lib/data/articles";

type FeedPageProps = {
  title: string;
  description: string;
  pathname: string;
  searchParams: Record<string, string | undefined>;
  currentUser:
    | {
        id: string;
        name?: string | null;
        email?: string | null;
        role?: string;
      }
    | null;
  categorySlug?: string;
  sourceSlug?: string;
  search?: string;
  bookmarkOnly?: boolean;
  forceFilter?: "all" | "saved";
};

export async function FeedPage({
  title,
  description,
  pathname,
  searchParams,
  currentUser,
  categorySlug,
  sourceSlug,
  search,
  bookmarkOnly = false,
  forceFilter,
}: FeedPageProps) {
  const filter = forceFilter ?? parseFeedFilter(searchParams.filter);
  const sort = parseFeedSort(searchParams.sort);
  const view = parseFeedView(searchParams.view);
  const page = parsePositiveInt(searchParams.page);

  const data = await getFeedData({
    categorySlug,
    sourceSlug,
    search,
    filter,
    sort,
    page,
    bookmarkOnly,
    userId: currentUser?.id,
  });

  return (
    <AppShell
      pathname={pathname}
      search={search}
      user={currentUser}
      categories={data.categories}
      sources={data.sources}
      popularArticles={data.popularArticles}
      recentArticles={data.recentArticles}
    >
      <div className="space-y-4">
        <section className="rounded-2xl border bg-card p-5">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </section>

        <FeedControls current={searchParams} filter={filter} sort={sort} view={view} />

        <FeedList
          articles={data.articles}
          view={view}
          disabledActions={!currentUser}
        />

        <FeedPagination
          page={data.page}
          totalPages={data.totalPages}
          current={searchParams}
        />
      </div>
    </AppShell>
  );
}
