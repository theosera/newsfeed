import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

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
