/**
 * Розмови з клієнтами — статуси, підписи, спільні типи.
 *
 * Чистий модуль: без Prisma і без next/*. Його читають і сторінки адмінки,
 * і серверні роути.
 */

import { z } from "zod";

/**
 * RECEIVED → UPLOADED → TRANSCRIBING → TRANSCRIBED → SUMMARIZING → READY | FAILED.
 */
export const CONVERSATION_STATUSES = [
  "RECEIVED",
  "UPLOADED",
  "TRANSCRIBING",
  "TRANSCRIBED",
  "SUMMARIZING",
  "READY",
  "FAILED",
] as const;
export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

export const STATUS_LABELS: Record<ConversationStatus, string> = {
  RECEIVED: "Отримано",
  UPLOADED: "У черзі",
  TRANSCRIBING: "Розпізнаю мовлення…",
  TRANSCRIBED: "У черзі на самарі",
  SUMMARIZING: "Складаю самарі…",
  READY: "Готово",
  FAILED: "Помилка",
};

export const STATUS_COLORS: Record<ConversationStatus, string> = {
  RECEIVED: "bg-gray-100 text-gray-700",
  UPLOADED: "bg-gray-100 text-gray-700",
  TRANSCRIBING: "bg-blue-100 text-blue-700",
  TRANSCRIBED: "bg-blue-100 text-blue-700",
  SUMMARIZING: "bg-indigo-100 text-indigo-700",
  READY: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

/** Стани, у яких сторінка розмови опитує сервер: обробка ще триває. */
export const IN_PROGRESS: readonly ConversationStatus[] = [
  "RECEIVED",
  "UPLOADED",
  "TRANSCRIBING",
  "TRANSCRIBED",
  "SUMMARIZING",
];

export const SOURCE_LABELS: Record<string, string> = {
  TELEGRAM: "Telegram",
  UPLOAD: "Завантаження",
  BINOTEL: "Binotel",
};

/** Одна репліка з розпізнавання: хто, коли (мс від початку), що сказав. */
export type Utterance = { speaker: string; start: number; end: number; text: string };

/** «03:25» або «1:03:25». */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/**
 * Структуроване самарі розмови — і схема для відповіді моделі, і тип для
 * сторінки. Без min/max і record: строга JSON-схема structured outputs їх не
 * приймає, обсяги задає промпт.
 */
export const ConversationSummarySchema = z.object({
  suggestedTitle: z.string(),
  clientName: z.string().nullable(),
  clientPhone: z.string().nullable(),
  matterType: z.string(),
  summary: z.string(),
  clientRequest: z.string(),
  facts: z.array(z.string()),
  lawyerAdvice: z.array(z.string()),
  agreements: z.array(z.string()),
  nextSteps: z.array(
    z.object({
      action: z.string(),
      who: z.enum(["LAWYER", "CLIENT", "OTHER"]),
      due: z.string().nullable(),
    })
  ),
  documentsRequested: z.array(z.string()),
  deadlines: z.array(z.string()),
  risks: z.array(z.string()),
  openQuestions: z.array(z.string()),
  speakers: z.array(
    z.object({
      label: z.string(),
      role: z.enum(["LAWYER", "CLIENT", "OTHER"]),
      name: z.string().nullable(),
    })
  ),
});
export type ConversationSummary = z.infer<typeof ConversationSummarySchema>;

export const ROLE_LABELS: Record<"LAWYER" | "CLIENT" | "OTHER", string> = {
  LAWYER: "Адвокат",
  CLIENT: "Клієнт",
  OTHER: "Інший",
};
