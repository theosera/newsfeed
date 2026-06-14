"use client";

import { FormEvent, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

type LoginFormProps = {
  githubEnabled: boolean;
  googleEnabled: boolean;
};

export function LoginForm({ githubEnabled, googleEnabled }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      setError(null);

      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError("メールアドレスまたはパスワードが正しくありません。");
        return;
      }

      router.push(result?.url ?? callbackUrl);
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-md space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold">ログイン</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          未読管理、保存、管理画面を使うにはログインしてください。
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none"
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={pending}>
          ログイン
        </Button>
      </form>

      {githubEnabled || googleEnabled ? (
        <div className="space-y-2 border-t pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            OAuth
          </p>
          <div className="grid gap-2">
            {githubEnabled ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => signIn("github", { callbackUrl })}
              >
                GitHub で続行
              </Button>
            ) : null}
            {googleEnabled ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => signIn("google", { callbackUrl })}
              >
                Google で続行
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
        <p>デモ用 seed 実行後は次の認証情報を使えます。</p>
        <p className="mt-2">`admin@example.com` / `demo1234`</p>
        <p>`demo@example.com` / `demo1234`</p>
      </div>
    </div>
  );
}
