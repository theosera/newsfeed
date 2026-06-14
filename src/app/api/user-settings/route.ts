import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getServerAuthSession } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

const settingsSchema = z.object({
  theme: z.enum(["SYSTEM", "LIGHT", "DARK"]).optional(),
  layout: z.enum(["CARD", "LIST", "NEWSPAPER"]).optional(),
  compactMode: z.boolean().optional(),
});

export async function GET() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.userSetting.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const settings = await prisma.userSetting.upsert({
    where: { userId: session.user.id },
    update: parsed.data,
    create: {
      userId: session.user.id,
      ...parsed.data,
    },
  });

  return NextResponse.json(settings);
}
