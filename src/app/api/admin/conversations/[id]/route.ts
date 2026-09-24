import { NextRequest, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAdminResult, ApiError } from "@/lib/admin-api";
import { reconcile, removeConversation } from "@/lib/conversations/process";
import { IN_PROGRESS, type ConversationStatus } from "@/lib/conversations/types";

// reconcile може дійти до самарі Claude.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const item = await prisma.conversation.findUnique({
      where: { id },
      omit: { transcript: true },
    });
    if (!item) throw new ApiError(404, "Розмову не знайдено");
    // Сторінка опитує картку, поки йде обробка, — заодно підбираємо застряглі кроки.
    if (IN_PROGRESS.includes(item.status as ConversationStatus)) after(() => reconcile(id));
    return { item };
  });
}

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .transform((v) => (v ? v : null));

const patchSchema = z
  .object({
    title: nullableText(200),
    clientName: nullableText(200),
    clientPhone: nullableText(50),
    lawyerNotes: nullableText(20_000),
    recordedAt: z.iso.datetime(),
  })
  .partial();

export async function PATCH(request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Невалідні дані");
    }
    const exists = await prisma.conversation.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new ApiError(404, "Розмову не знайдено");
    const { recordedAt, ...rest } = parsed.data;
    const item = await prisma.conversation.update({
      where: { id },
      data: { ...rest, ...(recordedAt ? { recordedAt: new Date(recordedAt) } : {}) },
      omit: { transcript: true },
    });
    return { item };
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    await removeConversation(id);
    return { ok: true };
  });
}
