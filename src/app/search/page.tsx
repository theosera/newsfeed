import { FeedPage } from "@/components/feed/feed-page";
import { getCurrentUser } from "@/lib/auth/guards";
import { normalizeSearchParams, type PageSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: PageSearchParams;
}) {
  const user = await getCurrentUser();
  const params = await normalizeSearchParams(searchParams);
  const search = params.q ?? "";

  return (
    <FeedPage
      title="Search"
      description={
        search
          ? `「${search}」の検索結果です。`
          : "タイトル、抜粋、ソース名で記事を検索できます。"
      }
      pathname="/search"
      searchParams={params}
      currentUser={user}
      search={search}
    />
  );
}
