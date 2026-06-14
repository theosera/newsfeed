import Link from "next/link";

import { buildQueryString } from "@/lib/data/articles";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FeedPaginationProps = {
  page: number;
  totalPages: number;
  current: Record<string, string | undefined>;
};

export function FeedPagination({
  page,
  totalPages,
  current,
}: FeedPaginationProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">
        Page {page} / {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildQueryString(current, { page: String(page - 1) })}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            前へ
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-50",
            )}
          >
            前へ
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={buildQueryString(current, { page: String(page + 1) })}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            次へ
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-50",
            )}
          >
            次へ
          </span>
        )}
      </div>
    </div>
  );
}
