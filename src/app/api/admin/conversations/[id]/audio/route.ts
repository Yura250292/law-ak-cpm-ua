import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import { presignedGetPrivate } from "@/lib/r2";

interface Params {
  params: Promise<{ id: string }>;
}

/** Плеєр у картці ходить сюди — віддаємо коротке підписане посилання на аудіо. */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
  const { id } = await params;
  const row = await prisma.conversation.findUnique({ where: { id }, select: { audioR2Key: true } });
  if (!row?.audioR2Key) return NextResponse.json({ error: "Аудіо немає" }, { status: 404 });
  const url = await presignedGetPrivate(row.audioR2Key, 60 * 60);
  return NextResponse.redirect(url, { headers: { "Cache-Control": "private, no-store" } });
}
