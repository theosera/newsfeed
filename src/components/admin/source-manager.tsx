"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

type CategoryItem = {
  id: string;
  name: string;
  description: string | null;
  _count: {
    articles: number;
    sources: number;
  };
};

type SourceItem = {
  id: string;
  name: string;
  url: string;
  websiteUrl: string | null;
  description: string | null;
  enabled: boolean;
  lastFetchedAt: string | Date | null;
  categoryId: string;
  category: {
    name: string;
  };
  _count: {
    articles: number;
  };
};

type SourceManagerProps = {
  initialCategories: CategoryItem[];
  initialSources: SourceItem[];
};

async function request(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: string | Record<string, string[]> }
      | null;
    throw new Error(
      typeof body?.error === "string" ? body.error : "Request failed.",
    );
  }

  return response;
}

export function SourceManager({
  initialCategories,
  initialSources,
}: SourceManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const defaultCategoryId = useMemo(
    () => initialCategories[0]?.id ?? "",
    [initialCategories],
  );
  const [sourceForm, setSourceForm] = useState({
    name: "",
    url: "",
    websiteUrl: "",
    description: "",
    categoryId: defaultCategoryId,
  });
  const [sourceDrafts, setSourceDrafts] = useState<Record<string, SourceItem>>(
    Object.fromEntries(initialSources.map((source) => [source.id, source])),
  );
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, CategoryItem>>(
    Object.fromEntries(initialCategories.map((category) => [category.id, category])),
  );

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        setMessage(null);
        await action();
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "操作に失敗しました。");
      }
    });
  }

  return (
    <div className="space-y-6">
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <section className="rounded-2xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">カテゴリ管理</h2>
            <p className="text-sm text-muted-foreground">
              新規作成、編集、削除ができます。
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1.2fr_1.8fr_auto]">
          <input
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="カテゴリ名"
            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
          />
          <input
            value={categoryDescription}
            onChange={(event) => setCategoryDescription(event.target.value)}
            placeholder="説明"
            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
          />
          <Button
            type="button"
            disabled={pending || !categoryName}
            onClick={() =>
              run(async () => {
                await request("/api/admin/categories", {
                  method: "POST",
                  body: JSON.stringify({
                    name: categoryName,
                    description: categoryDescription,
                  }),
                });
                setCategoryName("");
                setCategoryDescription("");
                setMessage("カテゴリを追加しました。");
              })
            }
          >
            追加
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {initialCategories.map((category) => {
            const draft = categoryDrafts[category.id] ?? category;

            return (
              <div
                key={category.id}
                className="grid gap-3 rounded-xl border p-4 md:grid-cols-[1.2fr_1.8fr_auto_auto]"
              >
                <input
                  value={draft.name}
                  onChange={(event) =>
                    setCategoryDrafts((prev) => ({
                      ...prev,
                      [category.id]: { ...draft, name: event.target.value },
                    }))
                  }
                  className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
                />
                <input
                  value={draft.description ?? ""}
                  onChange={(event) =>
                    setCategoryDrafts((prev) => ({
                      ...prev,
                      [category.id]: {
                        ...draft,
                        description: event.target.value,
                      },
                    }))
                  }
                  className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    run(async () => {
                      await request(`/api/admin/categories/${category.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({
                          name: draft.name,
                          description: draft.description,
                        }),
                      });
                      setMessage("カテゴリを更新しました。");
                    })
                  }
                >
                  保存
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={pending || category._count.sources > 0}
                  onClick={() =>
                    run(async () => {
                      await request(`/api/admin/categories/${category.id}`, {
                        method: "DELETE",
                      });
                      setMessage("カテゴリを削除しました。");
                    })
                  }
                >
                  削除
                </Button>
                <p className="text-xs text-muted-foreground md:col-span-4">
                  {category._count.sources} sources / {category._count.articles} articles
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">RSS ソース管理</h2>
            <p className="text-sm text-muted-foreground">
              追加、編集、取得実行、ON/OFF を管理します。
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() =>
              run(async () => {
                await request("/api/admin/fetch", {
                  method: "POST",
                  body: JSON.stringify({}),
                });
                setMessage("有効なフィードの取得を実行しました。");
              })
            }
          >
            すべて取得
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={sourceForm.name}
            onChange={(event) =>
              setSourceForm((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="ソース名"
            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
          />
          <input
            value={sourceForm.url}
            onChange={(event) =>
              setSourceForm((prev) => ({ ...prev, url: event.target.value }))
            }
            placeholder="RSS URL"
            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
          />
          <input
            value={sourceForm.websiteUrl}
            onChange={(event) =>
              setSourceForm((prev) => ({ ...prev, websiteUrl: event.target.value }))
            }
            placeholder="サイト URL"
            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
          />
          <select
            value={sourceForm.categoryId}
            onChange={(event) =>
              setSourceForm((prev) => ({ ...prev, categoryId: event.target.value }))
            }
            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
          >
            {initialCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            value={sourceForm.description}
            onChange={(event) =>
              setSourceForm((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="説明"
            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none md:col-span-2"
          />
          <Button
            type="button"
            disabled={pending || !sourceForm.name || !sourceForm.url || !sourceForm.categoryId}
            onClick={() =>
              run(async () => {
                await request("/api/admin/sources", {
                  method: "POST",
                  body: JSON.stringify(sourceForm),
                });
                setSourceForm({
                  name: "",
                  url: "",
                  websiteUrl: "",
                  description: "",
                  categoryId: defaultCategoryId,
                });
                setMessage("ソースを追加しました。");
              })
            }
          >
            ソース追加
          </Button>
        </div>

        <div className="mt-4 space-y-4">
          {initialSources.map((source) => {
            const draft = sourceDrafts[source.id] ?? source;

            return (
              <div key={source.id} className="rounded-xl border p-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <input
                    value={draft.name}
                    onChange={(event) =>
                      setSourceDrafts((prev) => ({
                        ...prev,
                        [source.id]: { ...draft, name: event.target.value },
                      }))
                    }
                    className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
                  />
                  <input
                    value={draft.url}
                    onChange={(event) =>
                      setSourceDrafts((prev) => ({
                        ...prev,
                        [source.id]: { ...draft, url: event.target.value },
                      }))
                    }
                    className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
                  />
                  <select
                    value={draft.categoryId}
                    onChange={(event) =>
                      setSourceDrafts((prev) => ({
                        ...prev,
                        [source.id]: { ...draft, categoryId: event.target.value },
                      }))
                    }
                    className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
                  >
                    {initialCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <input
                    value={draft.websiteUrl ?? ""}
                    onChange={(event) =>
                      setSourceDrafts((prev) => ({
                        ...prev,
                        [source.id]: {
                          ...draft,
                          websiteUrl: event.target.value,
                        },
                      }))
                    }
                    placeholder="サイト URL"
                    className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
                  />
                  <input
                    value={draft.description ?? ""}
                    onChange={(event) =>
                      setSourceDrafts((prev) => ({
                        ...prev,
                        [source.id]: {
                          ...draft,
                          description: event.target.value,
                        },
                      }))
                    }
                    placeholder="説明"
                    className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.enabled}
                      onChange={(event) =>
                        setSourceDrafts((prev) => ({
                          ...prev,
                          [source.id]: {
                            ...draft,
                            enabled: event.target.checked,
                          },
                        }))
                      }
                    />
                    取得有効
                  </label>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      run(async () => {
                        await request(`/api/admin/sources/${source.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({
                            name: draft.name,
                            url: draft.url,
                            websiteUrl: draft.websiteUrl ?? "",
                            description: draft.description ?? "",
                            categoryId: draft.categoryId,
                            enabled: draft.enabled,
                          }),
                        });
                        setMessage("ソースを更新しました。");
                      })
                    }
                  >
                    保存
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      run(async () => {
                        await request("/api/admin/fetch", {
                          method: "POST",
                          body: JSON.stringify({ sourceId: source.id }),
                        });
                        setMessage("フィード取得を実行しました。");
                      })
                    }
                  >
                    取得実行
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={pending}
                    onClick={() =>
                      run(async () => {
                        await request(`/api/admin/sources/${source.id}`, {
                          method: "DELETE",
                        });
                        setMessage("ソースを削除しました。");
                      })
                    }
                  >
                    削除
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {source._count.articles} articles ・ 最終取得{" "}
                    {source.lastFetchedAt
                      ? new Date(source.lastFetchedAt).toLocaleString("ja-JP")
                      : "未実行"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
