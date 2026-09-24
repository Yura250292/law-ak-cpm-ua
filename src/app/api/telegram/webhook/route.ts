import { NextRequest, NextResponse, after } from "next/server";
import { routeUpdate, type TgUpdate } from "@/lib/conversations/bot/router";
import { secretMatches } from "@/lib/conversations/secret";

// Скачування аудіо й відповіді асистента ідуть в after() — на це потрібен час.
export const maxDuration = 300;

/**
 * Вебхук бота розмов: меню, «Мої записи», прийом аудіо, AI-асистент.
 *
 * Telegram повторює апдейт, якщо не отримав 200, тож відповідаємо одразу, а
 * роботу робимо в after(). Дублі аудіо відсікає унікальний
 * (source, externalId = file_unique_id).
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

  const update = (await request.json().catch(() => null)) as TgUpdate | null;
  const work = update ? routeUpdate(update) : null;
  if (work) {
    after(async () => {
      try {
        await work();
      } catch (e) {
        console.error("[telegram] обробка апдейту:", e);
      }
    });
  }
  return NextResponse.json({ ok: true });
}
