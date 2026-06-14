"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Bookmark, CheckCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

type ArticleActionsProps = {
  articleId: string;
  isBookmarked: boolean;
  isRead: boolean;
  disabled?: boolean;
};

async function request(
  url: string,
  method: "POST" | "DELETE",
  body?: Record<string, string>,
) {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Request failed.");
  }
}

export function ArticleActions({
  articleId,
  isBookmarked,
  isRead,
  disabled = false,
}: ArticleActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function mutate(action: "bookmark" | "read") {
    setError(null);

    startTransition(async () => {
      try {
        if (action === "bookmark") {
          await request(
            "/api/bookmarks",
            isBookmarked ? "DELETE" : "POST",
            { articleId },
          );
        } else {
          await request(
            `/api/articles/${articleId}/${isRead ? "unread" : "read"}`,
            "POST",
          );
        }

        router.refresh();
      } catch (mutationError) {
        setError(
          mutationError instanceof Error ? mutationError.message : "更新に失敗しました。",
        );
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={isBookmarked ? "default" : "outline"}
          size="sm"
          disabled={disabled || pending}
          onClick={() => mutate("bookmark")}
        >
          <Bookmark className={isBookmarked ? "fill-current" : undefined} />
          <span>{isBookmarked ? "保存済み" : "保存"}</span>
        </Button>
        <Button
          type="button"
          variant={isRead ? "secondary" : "outline"}
          size="sm"
          disabled={disabled || pending}
          onClick={() => mutate("read")}
        >
          <CheckCheck />
          <span>{isRead ? "既読" : "未読"}</span>
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
