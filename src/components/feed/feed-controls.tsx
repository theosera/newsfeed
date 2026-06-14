import Link from "next/link";

import {
  buildQueryString,
  type FeedFilterMode,
  type FeedSortMode,
  type FeedViewMode,
} from "@/lib/data/articles";
import { cn } from "@/lib/utils";

const filters: Array<{ value: FeedFilterMode; label: string }> = [
  { value: "all", label: "すべて" },
  { value: "unread", label: "未読" },
  { value: "saved", label: "保存済み" },
];

const sorts: Array<{ value: FeedSortMode; label: string }> = [
  { value: "newest", label: "新着順" },
  { value: "oldest", label: "古い順" },
  { value: "popular", label: "人気順" },
];

const views: Array<{ value: FeedViewMode; label: string }> = [
  { value: "card", label: "Card" },
  { value: "list", label: "List" },
  { value: "newspaper", label: "News" },
];

type FeedControlsProps = {
  current: Record<string, string | undefined>;
  filter: FeedFilterMode;
  sort: FeedSortMode;
  view: FeedViewMode;
};

export function FeedControls({ current, filter, sort, view }: FeedControlsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((item) => (
          <Link
            key={item.value}
            href={buildQueryString(current, { filter: item.value, page: undefined })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              filter === item.value && "border-primary bg-primary text-primary-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {sorts.map((item) => (
            <Link
              key={item.value}
              href={buildQueryString(current, { sort: item.value, page: undefined })}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm",
                sort === item.value && "border-primary text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {views.map((item) => (
            <Link
              key={item.value}
              href={buildQueryString(current, { view: item.value })}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm",
                view === item.value && "border-primary text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
