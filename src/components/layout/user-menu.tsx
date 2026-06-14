"use client";

import Link from "next/link";
import { LogIn, LogOut, Settings, ShieldCheck, Star } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button, buttonVariants } from "@/components/ui/button";

type UserMenuProps = {
  user:
    | {
        name?: string | null;
        email?: string | null;
        role?: string;
      }
    | null;
};

export function UserMenu({ user }: UserMenuProps) {
  if (!user) {
    return (
      <Link href="/login" className={buttonVariants({ variant: "outline", size: "sm" })}>
        <LogIn />
        <span>ログイン</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-muted-foreground md:inline">
        {user.name ?? user.email}
      </span>
      <Link href="/saved" className={buttonVariants({ variant: "outline", size: "sm" })}>
        <Star />
        <span>保存</span>
      </Link>
      <Link
        href="/settings"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <Settings />
        <span>設定</span>
      </Link>
      {user.role === "ADMIN" ? (
        <Link
          href="/admin/sources"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ShieldCheck />
          <span>管理</span>
        </Link>
      ) : null}
      <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
        <LogOut />
        <span>ログアウト</span>
      </Button>
    </div>
  );
}
