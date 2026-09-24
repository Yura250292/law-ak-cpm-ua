/**
 * AI-асистент адвоката в Telegram — Gemini Flash з доступом до всіх розмов.
 *
 * Модель бачить каталог записів (дата, клієнт, тема) і сама вирішує, що
 * підтягнути інструментами: пошук по транскриптах і самарі, повна розмова,
 * список за період. Так обсяг контексту не росте разом з архівом: транскрипти
 * читаються лише ті, що стосуються питання.
 *
 * REST, а не @google/generative-ai: у Gemini 3 відповідь моделі з викликом
 * інструмента несе thoughtSignature, і її треба повернути в наступному запиті
 * без змін — тут ми просто кладемо content моделі назад як є.
 */

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { ProviderError, asProviderError, classifyHttp } from "./errors";
import { escapeHtml } from "./telegram";
import type { ConversationSummary } from "./types";

export const ASSISTANT_MODEL = process.env.GEMINI_ASSISTANT_MODEL || "gemini-3.8-flash";
const API = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_ROUNDS = 6;
const HISTORY_MESSAGES = 16;
const CATALOG_LIMIT = 300;
const TRANSCRIPT_LIMIT = 120_000;

type Part = {
  text?: string;
  thought?: boolean;
  functionCall?: { id?: string; name: string; args?: Record<string, unknown> };
  functionResponse?: { id?: string; name: string; response: Record<string, unknown> };
  [k: string]: unknown;
};
type Content = { role: "user" | "model"; parts: Part[] };

/* ---------- Дати ---------- */

function kyivDate(at: Date, withTime = false): string {
  return new Intl.DateTimeFormat("uk-UA", {
    timeZone: "Europe/Kyiv",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(at);
}

/** «2026-09-01» → початок доби за Києвом (з запасом у 3 год на зсув). */
function parseDay(s: unknown, endOfDay = false): Date | undefined {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
  const d = new Date(`${s}T${endOfDay ? "23:59:59" : "00:00:00"}+03:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/* ---------- Інструменти ---------- */

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "search_conversations",
        description:
          "Пошук розмов за словами в транскриптах, самарі, назвах, іменах клієнтів і нотатках адвоката. Повертає знайдені розмови з датою, клієнтом, коротким самарі й уривками транскрипту, де трапились слова. Використовуй для питань «коли ми говорили про…», «хто просив…», «що казав Павло про…».",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "Ключові слова українською (імена, предмет: «Павло договір оренди»). Кілька слів — шукається будь-яке з них, результати впорядковано за кількістю збігів.",
            },
            client: { type: "string", description: "Частина імені чи телефону клієнта, якщо відома." },
            date_from: { type: "string", description: "Від дати, YYYY-MM-DD." },
            date_to: { type: "string", description: "До дати включно, YYYY-MM-DD." },
          },
          required: ["query"],
        },
      },
      {
        name: "get_conversation",
        description:
          "Повна розмова за id: дата, клієнт, повне структуроване самарі (домовленості, кроки, строки, документи), нотатки адвоката і весь транскрипт з мітками спікерів. Використовуй, коли треба точна цитата чи деталі.",
        parameters: {
          type: "object",
          properties: { id: { type: "string", description: "id розмови з каталогу чи пошуку." } },
          required: ["id"],
        },
      },
      {
        name: "list_conversations",
        description:
          "Список розмов за період і/або клієнтом з коротким самарі, наступними кроками і строками. Використовуй для оглядових питань: «що було цього тижня», «які строки спливають», «усі розмови з Петренком».",
        parameters: {
          type: "object",
          properties: {
            date_from: { type: "string", description: "Від дати, YYYY-MM-DD." },
            date_to: { type: "string", description: "До дати включно, YYYY-MM-DD." },
            client: { type: "string", description: "Частина імені чи телефону клієнта." },
          },
        },
      },
    ],
  },
];

/** Грубий стемінг для української: «договору» і «договір» мають знайтись разом. */
function stems(query: string): string[] {
  const words = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length >= 3);
  const out = words.map((w) => (w.length > 6 ? w.slice(0, -2) : w.length > 4 ? w.slice(0, -1) : w));
  return [...new Set(out)].slice(0, 8);
}

function dateWhere(args: Record<string, unknown>): Prisma.ConversationWhereInput {
  const from = parseDay(args.date_from);
  const to = parseDay(args.date_to, true);
  return from || to ? { recordedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {};
}

function clientWhere(args: Record<string, unknown>): Prisma.ConversationWhereInput {
  const client = typeof args.client === "string" ? args.client.trim() : "";
  return client
    ? {
        OR: [
          { clientName: { contains: client, mode: "insensitive" } },
          { clientPhone: { contains: client } },
          { title: { contains: client, mode: "insensitive" } },
        ],
      }
    : {};
}

function snippets(text: string, keys: string[], max = 3): string[] {
  const lower = text.toLowerCase();
  const out: string[] = [];
  const used: number[] = [];
  for (const k of keys) {
    let from = 0;
    while (out.length < max) {
      const i = lower.indexOf(k, from);
      if (i < 0) break;
      from = i + k.length;
      if (used.some((u) => Math.abs(u - i) < 300)) continue;
      used.push(i);
      out.push(`…${text.slice(Math.max(0, i - 200), i + 250).replace(/\s+/g, " ")}…`);
    }
  }
  return out;
}

function shortSummary(structured: unknown, fallback: string | null): string {
  const s = structured as ConversationSummary | null;
  return (s?.summary ?? fallback ?? "").slice(0, 600);
}

async function searchConversations(args: Record<string, unknown>) {
  const keys = stems(String(args.query ?? ""));
  const fields = ["title", "clientName", "summary", "transcript", "lawyerNotes"] as const;
  const where: Prisma.ConversationWhereInput = {
    AND: [
      dateWhere(args),
      clientWhere(args),
      keys.length
        ? { OR: keys.flatMap((k) => fields.map((f) => ({ [f]: { contains: k, mode: "insensitive" } }))) }
        : {},
    ],
  };
  const rows = await prisma.conversation.findMany({
    where,
    orderBy: { recordedAt: "desc" },
    take: 60,
    select: {
      id: true,
      recordedAt: true,
      title: true,
      clientName: true,
      clientPhone: true,
      summary: true,
      structured: true,
      transcript: true,
      lawyerNotes: true,
    },
  });
  const scored = rows
    .map((r) => {
      const hay = [r.title, r.clientName, r.summary, r.transcript, r.lawyerNotes].join(" ").toLowerCase();
      return { r, score: keys.filter((k) => hay.includes(k)).length };
    })
    .sort((a, b) => b.score - a.score || b.r.recordedAt.getTime() - a.r.recordedAt.getTime())
    .slice(0, 8);

  return {
    found: scored.length,
    conversations: scored.map(({ r, score }) => ({
      id: r.id,
      date: kyivDate(r.recordedAt, true),
      client: r.clientName,
      phone: r.clientPhone,
      title: r.title,
      matched_words: score,
      summary: shortSummary(r.structured, r.summary),
      transcript_snippets: snippets(r.transcript ?? "", keys),
      lawyer_notes: r.lawyerNotes?.slice(0, 500) ?? null,
    })),
  };
}

async function getConversation(args: Record<string, unknown>) {
  const id = String(args.id ?? "");
  const r = await prisma.conversation.findUnique({
    where: { id },
    select: {
      id: true,
      recordedAt: true,
      title: true,
      clientName: true,
      clientPhone: true,
      status: true,
      structured: true,
      transcript: true,
      lawyerNotes: true,
      audioDurationMs: true,
    },
  });
  if (!r) return { error: "Розмову з таким id не знайдено" };
  const transcript = r.transcript ?? "";
  return {
    id: r.id,
    date: kyivDate(r.recordedAt, true),
    client: r.clientName,
    phone: r.clientPhone,
    title: r.title,
    status: r.status,
    duration_min: r.audioDurationMs ? Math.round(r.audioDurationMs / 60000) : null,
    summary: r.structured,
    lawyer_notes: r.lawyerNotes,
    transcript:
      transcript.length > TRANSCRIPT_LIMIT ? `${transcript.slice(0, TRANSCRIPT_LIMIT)}\n[… обрізано …]` : transcript,
  };
}

async function listConversations(args: Record<string, unknown>) {
  const rows = await prisma.conversation.findMany({
    where: { AND: [dateWhere(args), clientWhere(args)] },
    orderBy: { recordedAt: "desc" },
    take: 60,
    select: { id: true, recordedAt: true, title: true, clientName: true, structured: true, summary: true },
  });
  return {
    count: rows.length,
    conversations: rows.map((r) => {
      const s = r.structured as ConversationSummary | null;
      return {
        id: r.id,
        date: kyivDate(r.recordedAt, true),
        client: r.clientName,
        title: r.title,
        matter: s?.matterType ?? null,
        summary: shortSummary(r.structured, r.summary).slice(0, 400),
        next_steps: s?.nextSteps ?? [],
        deadlines: s?.deadlines ?? [],
      };
    }),
  };
}

async function runTool(name: string, args: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    if (name === "search_conversations") return await searchConversations(args);
    if (name === "get_conversation") return await getConversation(args);
    if (name === "list_conversations") return await listConversations(args);
    return { error: `Невідомий інструмент ${name}` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

/* ---------- Промпт ---------- */

async function systemPrompt(): Promise<string> {
  const catalog = await prisma.conversation.findMany({
    orderBy: { recordedAt: "desc" },
    take: CATALOG_LIMIT,
    select: { id: true, recordedAt: true, title: true, clientName: true, structured: true, status: true },
  });
  const lines = catalog.map((c) => {
    const matter = (c.structured as ConversationSummary | null)?.matterType ?? "";
    return `${c.id} | ${kyivDate(c.recordedAt, true)} | ${c.clientName ?? "клієнт невідомий"} | ${c.title ?? "без назви"}${matter ? ` | ${matter}` : ""}${c.status !== "READY" ? ` | ${c.status}` : ""}`;
  });

  return `Ти — AI-асистент адвоката Кабаль Анастасії. У тебе є архів записів її розмов з клієнтами (телефонні дзвінки й консультації): транскрипти, структуровані самарі (домовленості, наступні кроки, строки, документи) і нотатки адвоката. Ти допомагаєш згадувати, шукати й аналізувати: коли й з ким що обговорювали, що обіцяли, які строки й документи, яку позицію займав клієнт, що варто зробити далі.

Сьогодні: ${kyivDate(new Date(), true)} (Київ).

ЯК ПРАЦЮВАТИ
- Перш ніж відповісти про зміст розмов, знайди їх інструментами. Для точних цитат і деталей відкривай розмову через get_conversation.
- Якщо не знайшлось з першої спроби — спробуй інші слова (синоніми, інша форма імені: Павло/Паша/Павлом, прізвище), ширший період.
- Кажи, з якої розмови факт: дата й клієнт («24.09.2026, Іван Петренко»). Цитуй дослівно, коли це важливо.
- Не вигадуй. Чого немає в записах — так і скажи. Розпізнавання мовлення псує імена й цифри — якщо щось звучить нечітко, попередь.
- Можеш аналізувати й радити (строки, ризики, що підготувати), але відділяй факти з розмов від своїх міркувань.
- Відповідай українською, стисло й по суті: спершу відповідь, потім деталі. Форматування просте: **жирний** для головного, списки через «• ». Без таблиць і заголовків #.

КАТАЛОГ РОЗМОВ (id | дата | клієнт | тема | категорія), найновіші зверху, ${catalog.length} шт.:
${lines.join("\n") || "(архів порожній)"}`;
}

/* ---------- Виклик моделі ---------- */

async function generate(system: string, contents: Content[]): Promise<Content> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new ProviderError("GEMINI_API_KEY не задано", "fatal");
  let res: Response;
  try {
    res = await fetch(`${API}/${ASSISTANT_MODEL}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        tools: TOOLS,
      }),
      signal: AbortSignal.timeout(120_000),
    });
  } catch (e) {
    throw asProviderError(e, "Gemini");
  }
  const data = (await res.json().catch(() => null)) as {
    candidates?: { content?: Content; finishReason?: string }[];
    promptFeedback?: { blockReason?: string };
    error?: { message?: string };
  } | null;
  if (!res.ok) {
    const message = data?.error?.message ?? `HTTP ${res.status}`;
    throw new ProviderError(`Gemini: ${message}`, classifyHttp(res.status, message), res.status);
  }
  const content = data?.candidates?.[0]?.content;
  if (!content?.parts?.length) {
    const why = data?.promptFeedback?.blockReason ?? data?.candidates?.[0]?.finishReason ?? "порожня відповідь";
    throw new ProviderError(`Gemini: ${why}`, "retry");
  }
  return { role: "model", parts: content.parts };
}

export type AssistantAnswer = { html: string; refs: { id: string; label: string }[] };

/** Відповісти на питання адвоката з урахуванням історії чату. */
export async function askAssistant(chatId: string, question: string): Promise<AssistantAnswer> {
  const history = await prisma.assistantMessage.findMany({
    where: { chatId },
    orderBy: { createdAt: "desc" },
    take: HISTORY_MESSAGES,
  });
  const contents: Content[] = history
    .reverse()
    .map((m) => ({ role: m.role === "model" ? "model" : "user", parts: [{ text: m.text }] }) as Content);
  contents.push({ role: "user", parts: [{ text: question }] });

  const system = await systemPrompt();
  const opened = new Set<string>();
  const found: string[] = [];
  let answer = "";

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const reply = await generate(system, contents);
    contents.push(reply);
    const calls = reply.parts.filter((p) => p.functionCall);
    if (calls.length === 0) {
      answer = reply.parts
        .filter((p) => p.text && !p.thought)
        .map((p) => p.text)
        .join("")
        .trim();
      break;
    }
    const responses: Part[] = [];
    for (const p of calls) {
      const call = p.functionCall!;
      const args = call.args ?? {};
      const result = await runTool(call.name, args);
      if (call.name === "get_conversation" && !result.error) opened.add(String(args.id));
      if (call.name === "search_conversations") {
        for (const c of (result.conversations as { id: string }[] | undefined) ?? []) found.push(c.id);
      }
      responses.push({
        functionResponse: { ...(call.id ? { id: call.id } : {}), name: call.name, response: result },
      });
    }
    contents.push({ role: "user", parts: responses });
  }

  if (!answer) answer = "Не вдалося сформувати відповідь — спробуйте переформулювати питання.";

  await prisma.assistantMessage.createMany({
    data: [
      { chatId, role: "user", text: question },
      { chatId, role: "model", text: answer },
    ],
  });

  // Кнопки на розмови, на які спиралась відповідь: відкриті, а якщо таких немає — топ пошуку.
  const refIds = [...(opened.size ? opened : new Set(found.slice(0, 3)))].slice(0, 3);
  const refRows = refIds.length
    ? await prisma.conversation.findMany({
        where: { id: { in: refIds } },
        select: { id: true, recordedAt: true, clientName: true, title: true },
      })
    : [];
  const refs = refRows.map((r) => {
    const day = new Intl.DateTimeFormat("uk-UA", { timeZone: "Europe/Kyiv", day: "2-digit", month: "2-digit" }).format(
      r.recordedAt
    );
    const label = `📄 ${day} · ${r.clientName ?? r.title ?? "розмова"}`;
    return { id: r.id, label: label.length > 40 ? `${label.slice(0, 39)}…` : label };
  });

  return { html: markdownToTelegram(answer), refs };
}

export async function resetAssistant(chatId: string): Promise<void> {
  await prisma.assistantMessage.deleteMany({ where: { chatId } });
}

/** Простий Markdown моделі → HTML Telegram: жирний, курсив, списки, заголовки. */
export function markdownToTelegram(md: string): string {
  return escapeHtml(md)
    .replace(/^#{1,6}\s+(.+)$/gm, "<b>$1</b>")
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/__(.+?)__/g, "<b>$1</b>")
    .replace(/(^|[^*])\*(?!\s)([^*\n]+?)\*(?!\*)/g, "$1<i>$2</i>")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/`([^`\n]+)`/g, "<code>$1</code>");
}
