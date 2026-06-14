import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth/config";

export async function getCurrentUser() {
  const session = await getServerAuthSession();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== Role.ADMIN) {
    redirect("/");
  }

  return user;
}

/**
 * Admin guard for API route handlers (defense in depth — do not rely on the
 * proxy alone). Returns a JSON error response to return early when the caller
 * is not an authenticated admin, or null when access is allowed.
 */
export async function requireAdminApi(): Promise<NextResponse | null> {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
