import { NextRequest, after } from "next/server";
import { withAdminResult, ApiError } from "@/lib/admin-api";
import { attachUploadedAudio, submitForTranscription } from "@/lib/conversations/process";

export const maxDuration = 60;

interface Params {
  params: Promise<{ id: string }>;
}

/** Крок 2: файл уже в R2 — перевірити, що він справді там, і замовити розпізнавання. */
export async function POST(request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const { key, contentType } = (await request.json()) as { key?: string; contentType?: string };
    const r = await attachUploadedAudio(id, key ?? "", contentType ?? "");
    if (r === "bad-key") throw new ApiError(400, "Невірний ключ файлу");
    if (r === "missing") throw new ApiError(400, "Файл не завантажився — спробуйте ще раз");
    if (r === "busy") throw new ApiError(409, "Розмова вже обробляється");

    after(() => submitForTranscription(id));
    return { ok: true };
  });
}
