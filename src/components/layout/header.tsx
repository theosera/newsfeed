import Link from "next/link";
import { Search } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

type HeaderProps = {
  user:
    | {
        name?: string | null;
        email?: string | null;
        role?: string;
      }
    | null;
  search?: string;
};

export function Header({ user, search }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <div className="rounded-lg bg-primary px-2 py-1 text-sm font-semibold text-primary-foreground">
            NF
          </div>
          <div>
            <p className="text-sm font-semibold">Newsfeed</p>
            <p className="text-xs text-muted-foreground">Newsify-like dashboard</p>
          </div>
        </Link>

        <form action="/search" className="flex flex-1 items-center gap-2">
          <div className="flex w-full items-center rounded-lg border bg-card px-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="記事・ソースを検索"
              className="h-10 w-full bg-transparent px-2 text-sm outline-none"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
