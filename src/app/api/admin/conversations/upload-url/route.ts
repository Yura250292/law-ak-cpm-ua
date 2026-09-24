import { NextRequest } from "next/server";
import { withAdminResult, ApiError } from "@/lib/admin-api";
import { presignedPutPrivate } from "@/lib/r2";
import { createConversation } from "@/lib/conversations/process";
import {
  MAX_AUDIO_BYTES,
  audioKey,
  isAcceptableAudio,
  normalizeContentType,
} from "@/lib/conversations/keys";

/**
 * Крок 1 завантаження в адмінці: створити розмову й видати підписане посилання,
 * за яким браузер покладе файл прямо в приватний R2 (повз ліміт тіла запиту
 * Vercel у 4,5 МБ).
 */
export async function POST(request: NextRequest) {
  return withAdminResult(async () => {
    const { fileName, contentType, size } = (await request.json()) as {
      fileName?: string;
      contentType?: string;
      size?: number;
    };
    if (!fileName) throw new ApiError(400, "Не вказано файл");
    const type = normalizeContentType(contentType ?? "");
    if (!isAcceptableAudio(type, fileName)) throw new ApiError(400, "Це не схоже на аудіофайл");
    if (size && size > MAX_AUDIO_BYTES) throw new ApiError(400, "Файл завеликий (понад 500 МБ)");

    const created = await createConversation({ source: "UPLOAD", fileName });
    if (!created) throw new ApiError(500, "Не вдалося створити розмову");

    const key = audioKey(created.id, fileName, type);
    const url = await presignedPutPrivate(key, type);
    return { id: created.id, key, url, contentType: type };
  });
}
