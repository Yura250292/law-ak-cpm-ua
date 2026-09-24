/**
 * Telegram-бот розмов: приймає аудіо від адвоката і відповідає самарі.
 *
 * Звичайний fetch до Bot API, без бібліотек — потрібні лише sendMessage,
 * getFile і скачування файлу.
 */

import { ProviderError, asProviderError, classifyHttp } from "./errors";
import { formatClock, ROLE_LABELS, type ConversationSummary } from "./types";

const SERVICE = "Telegram";
const TG_MAX_TEXT = 4096;

function token(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new ProviderError("TELEGRAM_BOT_TOKEN не задано", "fatal");
  return t;
}

export function telegramConfigured(): boolean {
  return !!process.env.TELEGRAM_BOT_TOKEN;
}

/** Чати, з яких бот приймає записи і куди шле самарі. */
export function allowedChatIds(): string[] {
  return (process.env.TELEGRAM_ALLOWED_CHAT_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function api<T>(method: string, body: unknown, timeoutMs = 30_000): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    throw asProviderError(e, SERVICE);
  }
  const data = (await res.json().catch(() => null)) as
    | { ok: boolean; result?: T; description?: string }
    | null;
  if (!res.ok || !data?.ok) {
    const message = data?.description || `HTTP ${res.status}`;
    throw new ProviderError(`${SERVICE}: ${message}`, classifyHttp(res.status, message), res.status);
  }
  return data.result as T;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Ріже текст на шматки ≤ 4096 символів по межах рядків. */
function splitMessage(text: string): string[] {
  if (text.length <= TG_MAX_TEXT) return [text];
  const parts: string[] = [];
  let current = "";
  for (const line of text.split("\n")) {
    if ((current + "\n" + line).length > TG_MAX_TEXT) {
      if (current) parts.push(current);
      current = line.slice(0, TG_MAX_TEXT);
    } else {
      current = current ? `${current}\n${line}` : line;
    }
  }
  if (current) parts.push(current);
  return parts;
}

export type InlineButton = { text: string; callback_data?: string; url?: string };
export type InlineKeyboard = InlineButton[][];

type SendOptions = { replyTo?: number; keyboard?: InlineKeyboard };

export async function sendMessage(chatId: string, html: string, opts: SendOptions = {}): Promise<void> {
  const parts = splitMessage(html);
  for (let i = 0; i < parts.length; i++) {
    const last = i === parts.length - 1;
    await api("sendMessage", {
      chat_id: chatId,
      text: parts[i],
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
      ...(i === 0 && opts.replyTo
        ? { reply_parameters: { message_id: opts.replyTo, allow_sending_without_reply: true } }
        : {}),
      // Кнопки — під останнім шматком, щоб були під рукою.
      ...(last && opts.keyboard ? { reply_markup: { inline_keyboard: opts.keyboard } } : {}),
    });
  }
}

/** Замінити текст і кнопки повідомлення-меню (навігація «на місці»). */
export async function editMessage(
  chatId: string,
  messageId: number,
  html: string,
  keyboard?: InlineKeyboard
): Promise<void> {
  try {
    await api("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text: html.length > TG_MAX_TEXT ? `${html.slice(0, TG_MAX_TEXT - 2)}…` : html,
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
      ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
    });
  } catch (e) {
    // Натиснули ту саму кнопку двічі — Telegram каже «not modified», це не помилка.
    if (e instanceof ProviderError && /not modified/i.test(e.message)) return;
    throw e;
  }
}

export async function answerCallback(callbackId: string, text?: string): Promise<void> {
  try {
    await api("answerCallbackQuery", { callback_query_id: callbackId, ...(text ? { text } : {}) });
  } catch {
    // Запит застарів (понад 15 с) — кнопка все одно спрацює.
  }
}

/** «Друкує…» у шапці чату, поки асистент думає. */
export async function sendTyping(chatId: string): Promise<void> {
  try {
    await api("sendChatAction", { chat_id: chatId, action: "typing" });
  } catch {
    // не критично
  }
}

/** Надіслати, не кидаючи: повідомлення в Telegram не має ламати обробку. */
export async function notify(
  chatId: string | null | undefined,
  html: string,
  replyTo?: number,
  keyboard?: InlineKeyboard
): Promise<void> {
  if (!chatId || !telegramConfigured()) return;
  try {
    await sendMessage(chatId, html, { replyTo, keyboard });
  } catch (e) {
    console.warn("[conversations] Telegram:", e instanceof Error ? e.message : e);
  }
}

/** Скачати файл із серверів Telegram за file_id (Bot API віддає до 20 МБ). */
export async function downloadFile(fileId: string): Promise<Buffer> {
  const file = await api<{ file_path?: string }>("getFile", { file_id: fileId });
  if (!file.file_path) throw new ProviderError(`${SERVICE}: файл недоступний для скачування`, "fatal");
  let res: Response;
  try {
    res = await fetch(`https://api.telegram.org/file/bot${token()}/${file.file_path}`, {
      signal: AbortSignal.timeout(120_000),
    });
  } catch (e) {
    throw asProviderError(e, SERVICE);
  }
  if (!res.ok) {
    throw new ProviderError(`${SERVICE}: не вдалося скачати файл (HTTP ${res.status})`, classifyHttp(res.status, ""), res.status);
  }
  return Buffer.from(await res.arrayBuffer());
}

export function adminConversationUrl(id: string): string {
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  return `${base}/admin/conversations/${id}`;
}

function list(title: string, items: string[]): string {
  if (items.length === 0) return "";
  return `\n<b>${title}</b>\n${items.map((i) => `• ${escapeHtml(i)}`).join("\n")}\n`;
}

/** Самарі для Telegram: суть, домовленості, наступні кроки, строки. Решта — в адмінці. */
export function formatSummaryMessage(input: {
  id: string;
  structured: ConversationSummary;
  durationMs: number | null;
  /** Посилання на адмінку текстом; у картці бота замість нього — кнопка. */
  withLink?: boolean;
}): string {
  const s = input.structured;
  const head = [
    `<b>${escapeHtml(s.suggestedTitle)}</b>`,
    [
      s.clientName ? `👤 ${escapeHtml(s.clientName)}` : null,
      s.clientPhone ? `📞 ${escapeHtml(s.clientPhone)}` : null,
      `⚖️ ${escapeHtml(s.matterType)}`,
      input.durationMs ? `⏱ ${formatClock(input.durationMs)}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
  ].join("\n");

  const steps = s.nextSteps.map(
    (n) => `${ROLE_LABELS[n.who]}: ${n.action}${n.due ? ` (до ${n.due})` : ""}`
  );

  return [
    head,
    `\n${escapeHtml(s.summary)}\n`,
    list("Домовленості", s.agreements),
    list("Наступні кроки", steps),
    list("Строки", s.deadlines),
    list("Документи від клієнта", s.documentsRequested),
    input.withLink === false ? "" : `\n<a href="${adminConversationUrl(input.id)}">Відкрити в адмінці</a>`,
  ]
    .filter(Boolean)
    .join("");
}
