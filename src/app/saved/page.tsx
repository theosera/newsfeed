import { FeedPage } from "@/components/feed/feed-page";
import { requireUser } from "@/lib/auth/guards";
import { normalizeSearchParams, type PageSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

export default async function SavedPage({
  searchParams,
}: {
  searchParams?: PageSearchParams;
}) {
  const user = await requireUser();
  const params = await normalizeSearchParams(searchParams);

  return (
    <FeedPage
      title="Saved Articles"
      description="後で読み返したい記事を保存できます。"
      pathname="/saved"
      searchParams={params}
      currentUser={user}
      bookmarkOnly
      forceFilter="saved"
    />
  );
}
