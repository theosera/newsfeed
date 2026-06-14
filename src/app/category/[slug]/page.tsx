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

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const user = await getCurrentUser();
  const resolvedParams = await params;
  const category = await prisma.category.findUnique({
    where: { slug: resolvedParams.slug },
  });

  const query = await normalizeSearchParams(searchParams);

  return (
    <FeedPage
      title={category?.name ?? "Category"}
      description={category?.description ?? "カテゴリ別の記事一覧です。"}
      pathname={`/category/${resolvedParams.slug}`}
      searchParams={query}
      currentUser={user}
      categorySlug={resolvedParams.slug}
    />
  );
}
