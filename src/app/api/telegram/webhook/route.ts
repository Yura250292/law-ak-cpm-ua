import { NextRequest, NextResponse, after } from "next/server";
import { createConversation, storeAudioAndSubmit } from "@/lib/conversations/process";
import { isAcceptableAudio, TELEGRAM_MAX_BYTES } from "@/lib/conversations/keys";
import { secretMatches } from "@/lib/conversations/secret";
import { allowedChatIds, downloadFile, notify } from "@/lib/conversations/telegram";

// Скачування файлу з Telegram і завантаження в R2 ідуть в after() — на це
// потрібен час понад звичайний ліміт функції.
export const maxDuration = 300;

type TgFile = {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_name?: string;
  mime_type?: string;
};

type TgMessage = {
  message_id: number;
  date: number;
  chat: { id: number };
  text?: string;
  audio?: TgFile;
  voice?: TgFile;
  document?: TgFile;
  video?: TgFile;
};

/**
 * Вебхук бота розмов. Адвокат пересилає боту аудіо розмови — бот кладе його
 * в приватний R2 і замовляє розпізнавання; самарі прийде відповіддю на це
 * повідомлення.
 *
 * Telegram повторює апдейт, якщо не отримав 200, тож відповідаємо одразу, а
 * дублі відсікає унікальний (source, externalId = file_unique_id).
 */
export async function POST(request: NextRequest) {
  if (
    !secretMatches(
      request.headers.get("x-telegram-bot-api-secret-token"),
      process.env.TELEGRAM_WEBHOOK_SECRET
    )
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = (await request.json().catch(() => null)) as { message?: TgMessage } | null;
  const message = update?.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId = String(message.chat.id);
  const allowed = allowedChatIds().includes(chatId);

  if (message.text?.startsWith("/start")) {
    // chat_id потрібен, щоб додати адвоката в TELEGRAM_ALLOWED_CHAT_IDS.
    after(() =>
      notify(
        chatId,
        allowed
          ? "Надсилайте сюди аудіозаписи розмов з клієнтами — я поверну самарі, а запис збережу в адмінці сайту."
          : `Ваш chat_id: <code>${chatId}</code>\nДодайте його в TELEGRAM_ALLOWED_CHAT_IDS, щоб бот приймав записи.`
      )
    );
    return NextResponse.json({ ok: true });
  }

  // Чужі чати мовчки ігноруємо.
  if (!allowed) return NextResponse.json({ ok: true });

  const file = message.audio ?? message.voice ?? message.document ?? message.video;
  if (!file) {
    after(() => notify(chatId, "Надішліть аудіофайл розмови (m4a, mp3, ogg, amr…).", message.message_id));
    return NextResponse.json({ ok: true });
  }

  const fileName = file.file_name ?? (message.voice ? "voice.ogg" : "audio");
  const contentType = file.mime_type ?? "application/octet-stream";
  if (!isAcceptableAudio(contentType, fileName)) {
    after(() => notify(chatId, "Це не схоже на аудіо. Надішліть запис розмови.", message.message_id));
    return NextResponse.json({ ok: true });
  }

  if (file.file_size && file.file_size > TELEGRAM_MAX_BYTES) {
    const base = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
    after(() =>
      notify(
        chatId,
        `Файл більший за 20 МБ — Telegram не дає боту його скачати.\nЗавантажте його в адмінці: <a href="${base}/admin/conversations">Розмови</a>.`,
        message.message_id
      )
    );
    return NextResponse.json({ ok: true });
  }

  const created = await createConversation({
    source: "TELEGRAM",
    externalId: file.file_unique_id,
    telegramChatId: chatId,
    telegramMessageId: message.message_id,
    fileName: file.file_name ?? null,
    recordedAt: new Date(message.date * 1000),
  });
  if (!created) return NextResponse.json({ ok: true }); // повтор апдейту

  after(async () => {
    await notify(chatId, "Прийняв, обробляю… Самарі надішлю сюди за кілька хвилин.", message.message_id);
    await storeAudioAndSubmit(created.id, async () => ({
      body: await downloadFile(file.file_id),
      contentType,
      fileName,
    }));
  });

  return NextResponse.json({ ok: true });
}
