/**
 * Конвеєр розмови: аудіо в R2 → AssemblyAI → Claude → Telegram.
 *
 * На Vercel немає воркера, тож кожен крок запускає подія:
 * - надійшло аудіо (Telegram, завантаження в адмінці) → submitForTranscription;
 * - AssemblyAI постукав у вебхук → completeTranscription → summarize;
 * - адвокат відкрив картку → reconcile підбирає те, що застрягло.
 *
 * Кожен перехід статусу атомарний (updateMany where status = …): вебхук,
 * reconcile і ручний повтор можуть збігтися в часі, але крок виконає лише той,
 * хто перший перевів рядок.
 */

import { prisma } from "@/lib/prisma";
import type { ConversationStatus, Prisma } from "@/generated/prisma/client";
import { deletePrivate, headPrivate, presignedGetPrivate, putPrivate } from "@/lib/r2";
import {
  deleteTranscript,
  getTranscript,
  renderTranscript,
  submitTranscript,
  transcriptErrorKind,
} from "./assemblyai";
import { ProviderError, errorMessage } from "./errors";
import { audioKey, isConversationKey, normalizeContentType } from "./keys";
import { summarizeTranscript } from "./summarize";
import { escapeHtml, formatSummaryMessage, notify } from "./telegram";
import { HOME, cb, fresh } from "./bot/keyboard";

/** Скільки чекати вебхук, перш ніж опитати AssemblyAI самим. */
const STUCK_MS = 10 * 60_000;
/** Рядок без аудіо старший за це — завантаження кинули. */
const ABANDONED_MS = 60 * 60_000;

/** Адреса вебхука AssemblyAI; на localhost його не буде — тоді лише опитування. */
export function assemblyWebhookUrl(): string | null {
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  if (!base.startsWith("https://") || !process.env.ASSEMBLYAI_WEBHOOK_SECRET) return null;
  return `${base}/api/webhooks/assemblyai`;
}

/** Атомарний перехід: true, якщо саме цей виклик перевів рядок. */
async function transition(
  id: string,
  from: ConversationStatus[],
  to: ConversationStatus,
  data: Prisma.ConversationUpdateManyMutationInput = {}
): Promise<boolean> {
  const r = await prisma.conversation.updateMany({
    where: { id, status: { in: from } },
    data: { ...data, status: to, statusChangedAt: new Date() },
  });
  return r.count === 1;
}

async function fail(id: string, e: unknown): Promise<void> {
  const message = errorMessage(e);
  console.error(`[conversations] ${id}:`, message);
  const row = await prisma.conversation.update({
    where: { id },
    data: { status: "FAILED", processingError: message, statusChangedAt: new Date() },
    select: { telegramChatId: true, telegramMessageId: true },
  });
  await notify(
    row.telegramChatId,
    `⚠️ Не вдалося обробити запис: ${escapeHtml(message)}\nМожна повторити з картки розмови в адмінці.`,
    row.telegramMessageId ?? undefined,
    [[fresh(cb("📄 Картка розмови", `c:${id}`)), fresh(HOME)]]
  );
}

/* ---------- Вхід ---------- */

/**
 * Спільний вхід для всіх джерел: створити рядок розмови.
 * Повертає null, якщо такий запис уже є (Telegram повторив апдейт).
 */
export async function createConversation(
  data: Prisma.ConversationUncheckedCreateInput
): Promise<{ id: string } | null> {
  try {
    return await prisma.conversation.create({ data, select: { id: true } });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return null;
    throw e;
  }
}

type AudioSource = () => Promise<{ body: Buffer; contentType: string; fileName: string }>;

/**
 * Скачати аудіо з джерела (Telegram, пізніше АТС), покласти в приватний R2 і
 * замовити розпізнавання. Будь-яка помилка — FAILED з повідомленням у Telegram.
 */
export async function storeAudioAndSubmit(id: string, fetchAudio: AudioSource): Promise<void> {
  try {
    const audio = await fetchAudio();
    const contentType = normalizeContentType(audio.contentType);
    const key = audioKey(id, audio.fileName, contentType);
    await putPrivate(key, audio.body, contentType);
    await transition(id, ["RECEIVED"], "UPLOADED", {
      audioR2Key: key,
      audioMimeType: contentType,
      audioSizeBytes: audio.body.length,
    });
  } catch (e) {
    await fail(id, e);
    return;
  }
  await submitForTranscription(id);
}

/**
 * Файл уже лежить у R2 (його поклав браузер адмінки чи застосунок на Mac за
 * підписаним посиланням): перевірити, що він справді там, і прив'язати до
 * розмови. Після "ok" викликач замовляє розпізнавання через submitForTranscription.
 */
export async function attachUploadedAudio(
  id: string,
  key: string,
  contentType: string
): Promise<"ok" | "bad-key" | "missing" | "busy"> {
  if (!isConversationKey(id, key)) return "bad-key";
  const size = await headPrivate(key);
  if (size === null) return "missing";
  const r = await prisma.conversation.updateMany({
    where: { id, status: "RECEIVED" },
    data: {
      audioR2Key: key,
      audioMimeType: normalizeContentType(contentType),
      audioSizeBytes: size,
      status: "UPLOADED",
      statusChangedAt: new Date(),
    },
  });
  return r.count === 1 ? "ok" : "busy";
}

/* ---------- Розпізнавання ---------- */

export async function submitForTranscription(id: string): Promise<void> {
  const row = await prisma.conversation.findUnique({
    where: { id },
    select: { audioR2Key: true, status: true },
  });
  if (!row?.audioR2Key || row.status !== "UPLOADED") return;

  // Спершу займаємо рядок, потім ходимо в AssemblyAI — щоб два одночасні
  // виклики не замовили розпізнавання двічі.
  if (!(await transition(id, ["UPLOADED"], "TRANSCRIBING", { attempts: { increment: 1 } }))) return;

  try {
    const audioUrl = await presignedGetPrivate(row.audioR2Key, 30 * 60);
    const { id: transcriptId } = await submitTranscript({
      audioUrl,
      webhookUrl: assemblyWebhookUrl(),
      wordBoost: ["адвокат", "Кабаль"],
    });
    await prisma.conversation.update({
      where: { id },
      data: { assemblyTranscriptId: transcriptId, processingError: null },
    });
  } catch (e) {
    await fail(id, e);
  }
}

/**
 * Забрати результат розпізнавання. Викликають вебхук і reconcile.
 * Повертає true, якщо текст збережено і можна складати самарі.
 */
export async function completeTranscription(id: string): Promise<boolean> {
  const row = await prisma.conversation.findUnique({
    where: { id },
    select: { status: true, assemblyTranscriptId: true },
  });
  if (!row || row.status !== "TRANSCRIBING" || !row.assemblyTranscriptId) return false;

  let result;
  try {
    result = await getTranscript(row.assemblyTranscriptId);
  } catch (e) {
    // Служба тимчасово недоступна — вебхук чи reconcile спробують ще.
    if (e instanceof ProviderError && e.kind === "transient") return false;
    await fail(id, e);
    return false;
  }

  if (result.status === "queued" || result.status === "processing") return false;

  if (result.status === "error") {
    const message = result.error ?? "невідома помилка";
    const hint =
      transcriptErrorKind(message) === "fatal"
        ? "у записі не знайшлося мовлення"
        : "можна повторити обробку";
    await fail(id, new Error(`AssemblyAI: ${message} (${hint})`));
    return false;
  }

  if (result.utterances.length === 0) {
    await fail(id, new Error("У записі не знайшлося мовлення"));
    return false;
  }

  const saved = await transition(id, ["TRANSCRIBING"], "TRANSCRIBED", {
    transcript: renderTranscript(result.utterances),
    utterances: result.utterances as unknown as Prisma.InputJsonValue,
    audioDurationMs: result.audioDurationMs,
    processingError: null,
  });
  // Текст у нас — копія в AssemblyAI більше не потрібна.
  if (saved) await deleteTranscript(row.assemblyTranscriptId);
  return saved;
}

/* ---------- Самарі ---------- */

export async function summarize(id: string): Promise<void> {
  if (!(await transition(id, ["TRANSCRIBED"], "SUMMARIZING"))) return;

  const row = await prisma.conversation.findUniqueOrThrow({ where: { id } });
  try {
    const r = await summarizeTranscript({
      transcript: row.transcript ?? "",
      recordedAt: row.recordedAt,
      knownClientName: row.clientName,
      knownClientPhone: row.clientPhone,
      fileName: row.fileName,
    });
    const s = r.structured;
    const done = await transition(id, ["SUMMARIZING"], "READY", {
      summary: r.summaryText,
      structured: s as unknown as Prisma.InputJsonValue,
      aiModel: r.model,
      aiInputTokens: r.inputTokens,
      aiOutputTokens: r.outputTokens,
      processingError: null,
      // Те, що адвокат уже заповнив руками, не чіпаємо.
      title: row.title ?? s.suggestedTitle,
      clientName: row.clientName ?? s.clientName,
      clientPhone: row.clientPhone ?? s.clientPhone,
    });
    if (done) {
      await notify(
        row.telegramChatId,
        formatSummaryMessage({ id, structured: s, durationMs: row.audioDurationMs, withLink: false }),
        row.telegramMessageId ?? undefined,
        [[fresh(cb("📄 Картка й транскрипт", `c:${id}`)), fresh(HOME)]]
      );
    }
  } catch (e) {
    await fail(id, e);
  }
}

/** Після вебхука AssemblyAI: забрати текст і, якщо вийшло, скласти самарі. */
export async function onTranscriptWebhook(transcriptId: string): Promise<void> {
  const row = await prisma.conversation.findUnique({
    where: { assemblyTranscriptId: transcriptId },
    select: { id: true },
  });
  if (!row) return;
  if (await completeTranscription(row.id)) await summarize(row.id);
}

/* ---------- Страховка й ручні дії ---------- */

/**
 * Підібрати розмову, що застрягла: вебхук не прийшов, функцію Vercel вбили
 * посеред самарі, аудіо так і не завантажили. Викликається з картки в адмінці.
 */
export async function reconcile(id: string): Promise<void> {
  const row = await prisma.conversation.findUnique({
    where: { id },
    select: { status: true, statusChangedAt: true, audioR2Key: true },
  });
  if (!row) return;
  const age = Date.now() - row.statusChangedAt.getTime();
  // Без вебхука (localhost) опитуємо одразу, з вебхуком — лише якщо він загубився.
  const stuck = assemblyWebhookUrl() ? age > STUCK_MS : true;

  switch (row.status) {
    case "RECEIVED":
      if (age > ABANDONED_MS && !row.audioR2Key) {
        await fail(id, new Error("Аудіо так і не надійшло"));
      }
      return;
    case "UPLOADED":
      if (stuck) await submitForTranscription(id);
      return;
    case "TRANSCRIBING":
      if (stuck && (await completeTranscription(id))) await summarize(id);
      return;
    case "TRANSCRIBED":
      if (age > 30_000) await summarize(id);
      return;
    case "SUMMARIZING":
      if (age > STUCK_MS && (await transition(id, ["SUMMARIZING"], "TRANSCRIBED"))) {
        await summarize(id);
      }
      return;
  }
}

/**
 * «Повторити»: з помилки — з того кроку, де зупинились; з готової — лише
 * перескласти самарі (напр. після правки промпту).
 */
export async function retry(id: string): Promise<boolean> {
  const row = await prisma.conversation.findUnique({
    where: { id },
    select: { status: true, transcript: true, audioR2Key: true },
  });
  if (!row) return false;
  if (row.status !== "FAILED" && row.status !== "READY") return false;

  if (row.transcript) {
    if (!(await transition(id, [row.status], "TRANSCRIBED", { processingError: null }))) return false;
    await summarize(id);
    return true;
  }
  if (row.audioR2Key) {
    if (!(await transition(id, [row.status], "UPLOADED", { processingError: null }))) return false;
    await submitForTranscription(id);
    return true;
  }
  return false;
}

/** Видалити розмову разом з аудіо і транскриптом в AssemblyAI. */
export async function removeConversation(id: string): Promise<void> {
  const row = await prisma.conversation.findUnique({
    where: { id },
    select: { audioR2Key: true, assemblyTranscriptId: true },
  });
  if (!row) return;
  if (row.audioR2Key) await deletePrivate(row.audioR2Key);
  if (row.assemblyTranscriptId) await deleteTranscript(row.assemblyTranscriptId);
  await prisma.conversation.delete({ where: { id } });
}
