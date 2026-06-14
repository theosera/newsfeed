"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

type SettingsFormProps = {
  initialTheme: "SYSTEM" | "LIGHT" | "DARK";
  initialLayout: "CARD" | "LIST" | "NEWSPAPER";
  initialCompactMode: boolean;
};

export function SettingsForm({
  initialTheme,
  initialLayout,
  initialCompactMode,
}: SettingsFormProps) {
  const router = useRouter();
  const [theme, setTheme] = useState(initialTheme);
  const [layout, setLayout] = useState(initialLayout);
  const [compactMode, setCompactMode] = useState(initialCompactMode);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      setMessage(null);

      const response = await fetch("/api/user-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme, layout, compactMode }),
      });

      if (!response.ok) {
        setMessage("設定の保存に失敗しました。");
        return;
      }

      setMessage("設定を保存しました。");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 rounded-2xl border bg-card p-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">テーマ</label>
        <select
          value={theme}
          onChange={(event) => setTheme(event.target.value as typeof theme)}
          className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none"
        >
          <option value="SYSTEM">System</option>
          <option value="LIGHT">Light</option>
          <option value="DARK">Dark</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">既定レイアウト</label>
        <select
          value={layout}
          onChange={(event) => setLayout(event.target.value as typeof layout)}
          className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none"
        >
          <option value="CARD">Card</option>
          <option value="LIST">List</option>
          <option value="NEWSPAPER">Newspaper</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={compactMode}
          onChange={(event) => setCompactMode(event.target.checked)}
        />
        コンパクト表示を既定にする
      </label>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <Button type="button" onClick={save} disabled={pending}>
        保存
      </Button>
    </div>
  );
}
