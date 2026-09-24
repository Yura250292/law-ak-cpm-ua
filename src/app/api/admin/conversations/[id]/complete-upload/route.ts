import { NextRequest, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminResult, ApiError } from "@/lib/admin-api";
import { headPrivate } from "@/lib/r2";
import { isConversationKey, normalizeContentType } from "@/lib/conversations/keys";
import { submitForTranscription } from "@/lib/conversations/process";

export const maxDuration = 60;

interface Params {
  params: Promise<{ id: string }>;
}

/** Крок 2: файл уже в R2 — перевірити, що він справді там, і замовити розпізнавання. */
export async function POST(request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const { key, contentType } = (await request.json()) as { key?: string; contentType?: string };
    if (!key || !isConversationKey(id, key)) throw new ApiError(400, "Невірний ключ файлу");

    const size = await headPrivate(key);
    if (size === null) throw new ApiError(400, "Файл не завантажився — спробуйте ще раз");

    const r = await prisma.conversation.updateMany({
      where: { id, status: "RECEIVED" },
      data: {
        audioR2Key: key,
        audioMimeType: normalizeContentType(contentType ?? ""),
        audioSizeBytes: size,
        status: "UPLOADED",
        statusChangedAt: new Date(),
      },
    });
    if (r.count !== 1) throw new ApiError(409, "Розмова вже обробляється");

    after(() => submitForTranscription(id));
    return { ok: true };
  });
}
