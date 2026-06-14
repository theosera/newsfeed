import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <LoginForm
        githubEnabled={Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET)}
        googleEnabled={Boolean(
          process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
        )}
      />
    </main>
  );
}
