import { FeedPage } from "@/components/feed/feed-page";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { normalizeSearchParams, type PageSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: PageSearchParams;
};

export default async function SourcePage({ params, searchParams }: PageProps) {
  const user = await getCurrentUser();
  const resolvedParams = await params;
  const source = await prisma.source.findUnique({
    where: { slug: resolvedParams.slug },
  });
  const query = await normalizeSearchParams(searchParams);

  return (
    <FeedPage
      title={source?.name ?? "Source"}
      description={source?.description ?? "ソース別の記事一覧です。"}
      pathname={`/source/${resolvedParams.slug}`}
      searchParams={query}
      currentUser={user}
      sourceSlug={resolvedParams.slug}
    />
  );
}
