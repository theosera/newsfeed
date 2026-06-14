import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { RightPanel } from "@/components/layout/right-panel";
import { Sidebar } from "@/components/layout/sidebar";

type AppShellProps = {
  pathname: string;
  search?: string;
  user:
    | {
        name?: string | null;
        email?: string | null;
        role?: string;
      }
    | null;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    _count: {
      articles: number;
      sources: number;
    };
  }>;
  sources: Array<{
    id: string;
    name: string;
    slug: string;
    _count: {
      articles: number;
    };
  }>;
  popularArticles: Array<{
    id: string;
    title: string;
    publishedAt: Date;
    source: {
      name: string;
    };
  }>;
  recentArticles: Array<{
    id: string;
    title: string;
    publishedAt: Date;
    source: {
      name: string;
    };
  }>;
  children: React.ReactNode;
};

export function AppShell({
  pathname,
  search,
  user,
  categories,
  sources,
  popularArticles,
  recentArticles,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <Header user={user} search={search} />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 pb-24 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-6 xl:grid-cols-[260px_minmax(0,1fr)_280px]">
        <Sidebar categories={categories} sources={sources} pathname={pathname} />
        <section className="min-w-0">{children}</section>
        <RightPanel popularArticles={popularArticles} recentArticles={recentArticles} />
      </main>
      <MobileNav pathname={pathname} />
    </div>
  );
}
