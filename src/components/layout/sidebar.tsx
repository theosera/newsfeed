import Link from "next/link";
import { FolderOpen, Newspaper, Star } from "lucide-react";

import { cn } from "@/lib/utils";

type SidebarProps = {
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
  pathname: string;
};

function NavItem({
  href,
  label,
  count,
  active,
  icon,
}: {
  href: string;
  label: string;
  count?: number;
  active?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground",
        active && "bg-accent text-accent-foreground",
      )}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      {typeof count === "number" ? (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export function Sidebar({ categories, sources, pathname }: SidebarProps) {
  return (
    <aside className="hidden rounded-2xl border bg-card p-4 lg:block">
      <div className="space-y-6">
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Feed
          </p>
          <NavItem
            href="/"
            label="All"
            count={categories.reduce((total, item) => total + item._count.articles, 0)}
            active={pathname === "/"}
            icon={<Newspaper className="size-4" />}
          />
          <NavItem
            href="/saved"
            label="Saved"
            active={pathname.startsWith("/saved")}
            icon={<Star className="size-4" />}
          />
        </section>

        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Categories
          </p>
          {categories.map((category) => (
            <NavItem
              key={category.id}
              href={`/category/${category.slug}`}
              label={category.name}
              count={category._count.articles}
              active={pathname === `/category/${category.slug}`}
              icon={<FolderOpen className="size-4" />}
            />
          ))}
        </section>

        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sources
          </p>
          <div className="space-y-1">
            {sources.map((source) => (
              <NavItem
                key={source.id}
                href={`/source/${source.slug}`}
                label={source.name}
                count={source._count.articles}
                active={pathname === `/source/${source.slug}`}
              />
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
