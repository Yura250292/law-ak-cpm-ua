/**
 * Маршрутизація апдейтів бота: команди, натискання кнопок, аудіо, питання
 * асистенту. Повертає відкладену роботу — роут віддає її в after(), щоб
 * Telegram одразу отримав 200.
 */

import { askAssistant, resetAssistant } from "../assistant";
import { errorMessage } from "../errors";
import { isAcceptableAudio, TELEGRAM_MAX_BYTES } from "../keys";
import { createConversation, storeAudioAndSubmit } from "../process";
import {
  allowedChatIds,
  answerCallback,
  downloadFile,
  editMessage,
  escapeHtml,
  notify,
  sendMessage,
  sendTyping,
} from "../telegram";
import { HOME, cb, fresh, grid } from "./keyboard";
import {
  assistantScreen,
  cardScreen,
  homeScreen,
  monthListScreen,
  monthsScreen,
  transcriptScreen,
  uploadScreen,
  yearsScreen,
  type Screen,
} from "./screens";

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

export type TgUpdate = {
  message?: TgMessage;
  callback_query?: { id: string; data?: string; message?: { message_id: number; chat: { id: number } } };
};

type Work = () => Promise<void>;

/** Нижній ряд під повідомленнями-подіями: відкривають екран новим повідомленням. */
const EVENT_NAV = [fresh(HOME)];

async function renderScreen(data: string, chatId: string): Promise<Screen> {
  if (data === "home") return homeScreen();
  if (data === "upload") return uploadScreen();
  if (data === "years") return yearsScreen();
  if (data === "ai") return assistantScreen();
  if (data === "ai:new") {
    await resetAssistant(chatId);
    return assistantScreen(true);
  }
  let m: RegExpMatchArray | null;
  if ((m = data.match(/^y:(\d{4})$/))) return monthsScreen(m[1]);
  if ((m = data.match(/^mo:(\d{4}-\d{2}):(\d+)$/))) return monthListScreen(m[1], Number(m[2]));
  if ((m = data.match(/^c:([a-z0-9_]+)$/i))) return cardScreen(m[1]);
  if ((m = data.match(/^tr:([a-z0-9_]+):(\d+)$/i))) return transcriptScreen(m[1], Number(m[2]));
  return homeScreen();
}

function onCallback(q: NonNullable<TgUpdate["callback_query"]>): Work | null {
  const chatId = q.message ? String(q.message.chat.id) : null;
  if (!chatId || !allowedChatIds().includes(chatId)) return () => answerCallback(q.id);
  const raw = q.data ?? "home";
  const asNew = raw.startsWith("!");
  const data = asNew ? raw.slice(1) : raw;

  return async () => {
    await answerCallback(q.id);
    try {
      const s = await renderScreen(data, chatId);
      if (asNew || !q.message) await sendMessage(chatId, s.text, { keyboard: s.keyboard });
      else await editMessage(chatId, q.message.message_id, s.text, s.keyboard);
    } catch (e) {
      await notify(chatId, `⚠️ ${escapeHtml(errorMessage(e))}`, undefined, [EVENT_NAV]);
    }
  };
}

function onAudio(message: TgMessage, chatId: string, file: TgFile): Work | null {
  const fileName = file.file_name ?? (message.voice ? "voice.ogg" : "audio");
  const contentType = file.mime_type ?? "application/octet-stream";
  const reply = (html: string) => notify(chatId, html, message.message_id, [EVENT_NAV]);

  if (!isAcceptableAudio(contentType, fileName)) {
    return () => reply("Це не схоже на аудіо. Надішліть запис розмови (m4a, mp3, ogg, amr, wav).");
  }
  if (file.file_size && file.file_size > TELEGRAM_MAX_BYTES) {
    const base = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
    return () =>
      reply(
        `Файл більший за 20 МБ — Telegram не дає боту його скачати.\nЗавантажте його в адмінці: <a href="${base}/admin/conversations">Розмови</a>.`
      );
  }

  return async () => {
    const created = await createConversation({
      source: "TELEGRAM",
      externalId: file.file_unique_id,
      telegramChatId: chatId,
      telegramMessageId: message.message_id,
      fileName: file.file_name ?? null,
      recordedAt: new Date(message.date * 1000),
    });
    if (!created) return; // той самий файл уже надсилали
    await reply("✅ Прийняв, обробляю… Самарі надішлю сюди за кілька хвилин.");
    await storeAudioAndSubmit(created.id, async () => ({
      body: await downloadFile(file.file_id),
      contentType,
      fileName,
    }));
  };
}

function onQuestion(message: TgMessage, chatId: string, text: string): Work {
  return async () => {
    await sendTyping(chatId);
    // Поки модель шукає й читає транскрипти, «друкує…» гасне через 5 с — підтримуємо.
    const typing = setInterval(() => void sendTyping(chatId), 4500);
    try {
      const a = await askAssistant(chatId, text);
      const refs = a.refs.map((r) => fresh(cb(r.label, `c:${r.id}`)));
      await sendMessage(chatId, a.html, {
        replyTo: message.message_id,
        keyboard: [...grid(refs, 1), [fresh(cb("🆕 Нова розмова", "ai:new")), fresh(HOME)]],
      });
    } catch (e) {
      await notify(
        chatId,
        `⚠️ Асистент не зміг відповісти: ${escapeHtml(errorMessage(e))}`,
        message.message_id,
        [EVENT_NAV]
      );
    } finally {
      clearInterval(typing);
    }
  };
}

/** Розібрати апдейт. null — нічого робити не треба. */
export function routeUpdate(update: TgUpdate): Work | null {
  if (update.callback_query) return onCallback(update.callback_query);

  const message = update.message;
  if (!message) return null;
  const chatId = String(message.chat.id);
  const allowed = allowedChatIds().includes(chatId);
  const text = message.text?.trim() ?? "";

  if (!allowed) {
    // chat_id потрібен, щоб додати адвоката в TELEGRAM_ALLOWED_CHAT_IDS; решті — тиша.
    if (text.startsWith("/start")) {
      return () =>
        notify(
          chatId,
          `Ваш chat_id: <code>${chatId}</code>\nДодайте його в TELEGRAM_ALLOWED_CHAT_IDS, щоб бот приймав записи.`
        );
    }
    return null;
  }

  if (text === "/start" || text === "/menu" || text.startsWith("/start ")) {
    const s = homeScreen();
    return () => sendMessage(chatId, s.text, { keyboard: s.keyboard });
  }
  if (text === "/new") {
    return async () => {
      await resetAssistant(chatId);
      const s = assistantScreen(true);
      await sendMessage(chatId, s.text, { keyboard: s.keyboard });
    };
  }

  const file = message.audio ?? message.voice ?? message.document ?? message.video;
  if (file) return onAudio(message, chatId, file);

  if (text && !text.startsWith("/")) return onQuestion(message, chatId, text);

  const s = homeScreen();
  return () => sendMessage(chatId, s.text, { keyboard: s.keyboard });
}

