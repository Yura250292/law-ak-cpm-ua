import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { presignedPutPrivate } from "@/lib/r2";
import { createConversation } from "@/lib/conversations/process";
import { ingestUnauthorized } from "@/lib/conversations/ingest-auth";
import { allowedChatIds } from "@/lib/conversations/telegram";
import {
  MAX_AUDIO_BYTES,
  audioKey,
  isAcceptableAudio,
  normalizeContentType,
} from "@/lib/conversations/keys";

const Body = z.object({
  /** Ідентифікатор запису на Mac — повторне надсилання не створить дубля. */
  externalId: z.string().min(8).max(100),
  fileName: z.string().min(1).max(200),
  contentType: z.string().max(100),
  size: z.number().int().positive().max(MAX_AUDIO_BYTES),
  recordedAt: z.coerce.date(),
  durationMs: z.number().int().nonnegative().optional(),
});

/**
 * Крок 1 завантаження з Mac: створити розмову й видати підписане посилання в
 * приватний R2. Якщо цей запис уже приходив і файл ще не долетів — видаємо
 * нове посилання на той самий рядок; якщо файл уже там — `uploaded: true`.
 */
export async function POST(request: NextRequest) {
  const denied = ingestUnauthorized(request);
  if (denied) return denied;

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const b = parsed.data;
  const type = normalizeContentType(b.contentType);
  if (!isAcceptableAudio(type, b.fileName)) {
    return NextResponse.json({ error: "not audio" }, { status: 400 });
  }

  let id = (
    await createConversation({
      source: "MAC",
      externalId: b.externalId,
      fileName: b.fileName,
      recordedAt: b.recordedAt,
      audioDurationMs: b.durationMs ?? null,
      telegramChatId: allowedChatIds()[0] ?? null,
    })
  )?.id;

  if (!id) {
    const existing = await prisma.conversation.findUnique({
      where: { source_externalId: { source: "MAC", externalId: b.externalId } },
      select: { id: true, status: true },
    });
    if (!existing) return NextResponse.json({ error: "conflict" }, { status: 409 });
    if (existing.status !== "RECEIVED") return NextResponse.json({ id: existing.id, uploaded: true });
    id = existing.id;
  }

  const key = audioKey(id, b.fileName, type);
  const url = await presignedPutPrivate(key, type);
  return NextResponse.json({ id, key, url, contentType: type, uploaded: false });
}
