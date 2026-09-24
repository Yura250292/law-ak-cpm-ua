/**
 * Екрани бота: текст + клавіатура. Кожен екран — чиста функція від даних з
 * бази; навігацію між ними робить router.ts.
 */

import { prisma } from "@/lib/prisma";
import type { InlineKeyboard } from "../telegram";
import { adminConversationUrl, escapeHtml, formatSummaryMessage } from "../telegram";
import {
  ROLE_LABELS,
  STATUS_LABELS,
  formatClock,
  type ConversationStatus,
  type ConversationSummary,
  type Utterance,
} from "../types";
import { cb, grid, link, nav, screen } from "./keyboard";

export type Screen = { text: string; keyboard: InlineKeyboard };

const MONTHS = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];
const PAGE_SIZE = 8;
const TRANSCRIPT_PAGE_CHARS = 3500;

/** recordedAt у базі — UTC; роки й місяці рахуємо за київським часом. */
const LOCAL = `(("recordedAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Kyiv')`;

function kyiv(at: Date, withTime = true): string {
  return new Intl.DateTimeFormat("uk-UA", {
    timeZone: "Europe/Kyiv",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(at);
}

function monthOf(at: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(at);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  return `${y}-${m}`;
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

/* ---------- Головна, завантаження, асистент ---------- */

export function homeScreen(): Screen {
  return {
    text: "⚖️ <b>Помічник адвоката</b>\n\nЗаписи розмов з клієнтами, їх самарі й AI-асистент, який пам'ятає всі розмови.\n\nОберіть дію:",
    keyboard: [
      [cb("📤 Завантажити запис", "upload"), cb("🗂 Мої записи", "years")],
      [cb("🤖 AI-асистент", "ai")],
    ],
  };
}

export function uploadScreen(): Screen {
  return {
    text: [
      "📤 <b>Завантажити запис</b>",
      "",
      "Просто надішліть або перешліть сюди аудіофайл розмови — m4a, mp3, ogg, amr, wav.",
      "",
      "• <b>iPhone</b>: Нотатки → запис → «Поділитися» → цей бот.",
      "• <b>Android</b>: Телефон → Недавні → дзвінок → запис → «Поділитися».",
      "• <b>Диктофон</b>: «Поділитися» → цей бот.",
      "",
      "За кілька хвилин я пришлю самарі, а запис з'явиться в «Моїх записах».",
      "Файли понад 20 МБ завантажуйте в адмінці сайту.",
    ].join("\n"),
    keyboard: screen([], undefined),
  };
}

export function assistantScreen(cleared = false): Screen {
  return {
    text: [
      "🤖 <b>AI-асистент</b>",
      "",
      cleared ? "Почали нову розмову — попередній контекст забуто.\n" : "",
      "Я маю доступ до всіх записів, транскриптів і самарі. Просто напишіть питання, наприклад:",
      "",
      "• <i>Коли ми з Павлом обговорювали договір оренди?</i>",
      "• <i>Які документи мав донести Петренко?</i>",
      "• <i>Які строки спливають цього місяця?</i>",
      "• <i>Що я порадила клієнтці щодо аліментів?</i>",
    ]
      .filter((l) => l !== "")
      .join("\n"),
    keyboard: screen([[cb("🆕 Нова розмова", "ai:new")]]),
  };
}

/* ---------- Мої записи: роки → місяці → список ---------- */

export async function yearsScreen(): Promise<Screen> {
  const rows = await prisma.$queryRawUnsafe<{ y: string; n: bigint }[]>(
    `SELECT to_char(${LOCAL}, 'YYYY') AS y, count(*) AS n FROM "Conversation" GROUP BY 1 ORDER BY 1 DESC`
  );
  if (rows.length === 0) {
    return {
      text: "🗂 <b>Мої записи</b>\n\nЗаписів ще немає. Надішліть аудіофайл розмови — і він з'явиться тут.",
      keyboard: screen([[cb("📤 Завантажити запис", "upload")]]),
    };
  }
  return {
    text: "🗂 <b>Мої записи</b>\n\nОберіть рік:",
    keyboard: screen(grid(rows.map((r) => cb(`${r.y} · ${r.n}`, `y:${r.y}`)))),
  };
}

export async function monthsScreen(year: string): Promise<Screen> {
  const rows = await prisma.$queryRawUnsafe<{ m: string; n: bigint }[]>(
    `SELECT to_char(${LOCAL}, 'MM') AS m, count(*) AS n FROM "Conversation"
     WHERE to_char(${LOCAL}, 'YYYY') = $1 GROUP BY 1 ORDER BY 1 DESC`,
    year
  );
  return {
    text: `🗂 <b>Мої записи · ${escapeHtml(year)}</b>\n\nОберіть місяць:`,
    keyboard: screen(
      grid(rows.map((r) => cb(`${MONTHS[Number(r.m) - 1]} · ${r.n}`, `mo:${year}-${r.m}:0`))),
      "years"
    ),
  };
}

export async function monthListScreen(ym: string, page: number): Promise<Screen> {
  const [year, month] = ym.split("-");
  const rows = await prisma.$queryRawUnsafe<
    {
      id: string;
      title: string | null;
      clientName: string | null;
      fileName: string | null;
      recordedAt: Date;
      status: ConversationStatus;
    }[]
  >(
    `SELECT id, title, "clientName", "fileName", "recordedAt", status FROM "Conversation"
     WHERE to_char(${LOCAL}, 'YYYY-MM') = $1
     ORDER BY "recordedAt" DESC LIMIT ${PAGE_SIZE + 1} OFFSET ${page * PAGE_SIZE}`,
    ym
  );
  const hasMore = rows.length > PAGE_SIZE;
  const items = rows.slice(0, PAGE_SIZE);

  // Назви довгі — по одній кнопці в рядку, так їх видно повністю.
  const list = items.map((c) => {
    const day = new Intl.DateTimeFormat("uk-UA", {
      timeZone: "Europe/Kyiv",
      day: "2-digit",
      month: "2-digit",
    }).format(c.recordedAt);
    const who = c.clientName ? `${c.clientName} — ` : "";
    const what = c.title ?? c.fileName ?? STATUS_LABELS[c.status];
    const mark = c.status === "READY" ? "" : c.status === "FAILED" ? "⚠️ " : "⏳ ";
    return [cb(truncate(`${mark}${day} · ${who}${what}`, 60), `c:${c.id}`)];
  });

  const pager = [
    ...(page > 0 ? [cb("◀️ Новіші", `mo:${ym}:${page - 1}`)] : []),
    ...(hasMore ? [cb("Старіші ▶️", `mo:${ym}:${page + 1}`)] : []),
  ];

  return {
    text: `🗂 <b>${MONTHS[Number(month) - 1]} ${escapeHtml(year)}</b>${page > 0 ? ` · стор. ${page + 1}` : ""}\n\nОберіть розмову:`,
    keyboard: screen([...list, ...(pager.length ? [pager] : [])], `y:${year}`),
  };
}

/* ---------- Картка розмови й транскрипт ---------- */

async function loadConversation(id: string) {
  return prisma.conversation.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      clientName: true,
      clientPhone: true,
      recordedAt: true,
      audioDurationMs: true,
      status: true,
      structured: true,
      utterances: true,
      processingError: true,
      fileName: true,
    },
  });
}

export async function cardScreen(id: string): Promise<Screen> {
  const c = await loadConversation(id);
  if (!c) return { text: "Розмову не знайдено — можливо, її видалили.", keyboard: [nav("years")] };

  const backData = `mo:${monthOf(c.recordedAt)}:0`;
  const meta = [
    `📅 ${kyiv(c.recordedAt)}`,
    c.audioDurationMs ? `⏱ ${formatClock(c.audioDurationMs)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const buttons = [
    ...(c.utterances ? [cb("📜 Транскрипт", `tr:${c.id}:0`)] : []),
    link("🔗 В адмінці", adminConversationUrl(c.id)),
  ];

  if (c.status !== "READY" || !c.structured) {
    const state =
      c.status === "FAILED"
        ? `⚠️ Помилка обробки: ${escapeHtml(c.processingError ?? "невідома")}`
        : `⏳ ${STATUS_LABELS[c.status]}`;
    return {
      text: `<b>${escapeHtml(c.title ?? c.fileName ?? "Розмова")}</b>\n${meta}\n\n${state}`,
      keyboard: screen([buttons], backData),
    };
  }

  const body = formatSummaryMessage({
    id: c.id,
    structured: c.structured as unknown as ConversationSummary,
    durationMs: null,
    withLink: false,
  });
  return {
    text: `${meta}\n\n${body}`,
    keyboard: screen([buttons], backData),
  };
}

/** Транскрипт посторінково: одна сторінка — до ~3500 символів. */
export async function transcriptScreen(id: string, page: number): Promise<Screen> {
  const c = await loadConversation(id);
  const utterances = (c?.utterances ?? []) as unknown as Utterance[];
  if (!c || utterances.length === 0) {
    return { text: "Транскрипту немає.", keyboard: [nav(`c:${id}`)] };
  }

  const roles = new Map(
    ((c.structured as unknown as ConversationSummary | null)?.speakers ?? []).map((s) => [s.label, s])
  );
  const name = (label: string) => {
    const s = roles.get(label);
    return s ? ROLE_LABELS[s.role] : `Спікер ${label}`;
  };

  const pages: string[] = [];
  let current = "";
  for (const u of utterances) {
    const line = `<b>${name(u.speaker)}</b> <code>${formatClock(u.start)}</code>\n${escapeHtml(u.text)}\n\n`;
    if (current && current.length + line.length > TRANSCRIPT_PAGE_CHARS) {
      pages.push(current);
      current = "";
    }
    current += line.length > TRANSCRIPT_PAGE_CHARS ? `${line.slice(0, TRANSCRIPT_PAGE_CHARS)}…\n\n` : line;
  }
  if (current) pages.push(current);

  const p = Math.min(Math.max(0, page), pages.length - 1);
  const pager = [
    ...(p > 0 ? [cb("◀️", `tr:${id}:${p - 1}`)] : []),
    cb(`${p + 1} / ${pages.length}`, `tr:${id}:${p}`),
    ...(p < pages.length - 1 ? [cb("▶️", `tr:${id}:${p + 1}`)] : []),
  ];

  return {
    text: `📜 <b>${escapeHtml(truncate(c.title ?? "Транскрипт", 80))}</b>\n\n${pages[p]}`,
    keyboard: screen(pages.length > 1 ? [pager] : [], `c:${id}`),
  };
}
