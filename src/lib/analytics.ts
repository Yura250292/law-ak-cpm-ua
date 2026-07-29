import { createHash } from "crypto";

// Мінімальна власна аналітика без cookie та зовнішніх сервісів.
// Ідентифікатор відвідувача — денний хеш (IP + User-Agent + сіль),
// тому персональні дані не зберігаються, а денний унікум рахується коректно.

export type Device = "desktop" | "mobile" | "tablet" | "bot";

const BOT_PATTERN =
  /bot|crawler|spider|crawling|slurp|facebookexternalhit|preview|monitor|curl|wget|python-requests|headless|lighthouse|pingdom|gtmetrix|ahrefs|semrush|dataprovider|node-fetch|axios/i;

const TABLET_PATTERN = /ipad|tablet|playbook|silk|(android(?!.*mobile))/i;
const MOBILE_PATTERN =
  /android|iphone|ipod|windows phone|blackberry|opera mini|iemobile|mobile/i;

export function detectDevice(userAgent: string): Device {
  const ua = userAgent || "";
  if (!ua || BOT_PATTERN.test(ua)) return "bot";
  if (TABLET_PATTERN.test(ua)) return "tablet";
  if (MOBILE_PATTERN.test(ua)) return "mobile";
  return "desktop";
}

export function detectBrowser(userAgent: string): string {
  const ua = userAgent || "";
  // Порядок важливий: Edge/Opera маскуються під Chrome, Chrome — під Safari.
  if (/edg[ea]?\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung Internet";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  return "Інший";
}

/** IP з заголовків проксі (Vercel / Cloudflare / nginx). */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-vercel-forwarded-for") ??
    "unknown"
  );
}

/** Країна від CDN, якщо доступна. */
export function getCountry(headers: Headers): string | null {
  return (
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    null
  );
}

function salt(): string {
  return process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD ?? "analytics";
}

/**
 * Анонімний ID відвідувача, стабільний у межах доби (UTC).
 * Незворотний: з хеша неможливо відновити IP.
 */
export function makeVisitorId(ip: string, userAgent: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${ip}|${userAgent}|${day}|${salt()}`)
    .digest("hex")
    .slice(0, 32);
}

/** Нормалізує шлях: прибирає query, хеш і кінцевий слеш. Обрізає довгі URL. */
export function normalizePath(raw: string): string {
  let path = (raw || "/").split("?")[0]!.split("#")[0]!;
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, "") || "/";
  return path.slice(0, 300);
}

/**
 * Нормалізує referrer до домену. Внутрішні переходи → null,
 * щоб у звіті "Джерела" були лише зовнішні.
 */
export function normalizeReferrer(
  raw: string | null | undefined,
  ownHost: string | null
): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");
    // ownHost приходить із заголовка Host і може містити порт — прибираємо.
    const own = ownHost?.split(":")[0]!.replace(/^www\./, "");
    if (own && host === own) return null;
    return host.slice(0, 200);
  } catch {
    return null;
  }
}

/** Людська назва джерела для дашборда. */
export function labelReferrer(host: string | null): string {
  if (!host) return "Прямий перехід";
  if (/google\./i.test(host)) return "Google";
  if (/bing\./i.test(host)) return "Bing";
  if (/duckduckgo/i.test(host)) return "DuckDuckGo";
  if (/facebook|fb\.com/i.test(host)) return "Facebook";
  if (/instagram/i.test(host)) return "Instagram";
  if (/t\.me|telegram/i.test(host)) return "Telegram";
  if (/youtube|youtu\.be/i.test(host)) return "YouTube";
  if (/linkedin/i.test(host)) return "LinkedIn";
  if (/tiktok/i.test(host)) return "TikTok";
  return host;
}

/** Людська назва сторінки для дашборда. */
export function labelPath(path: string): string {
  const exact: Record<string, string> = {
    "/": "Головна",
    "/about": "Про адвоката",
    "/services": "Послуги",
    "/practices": "Сфери практики",
    "/blog": "Блог",
    "/reviews": "Відгуки",
    "/samples": "Зразки документів",
    "/contact": "Контакти",
    "/consultation": "Консультація",
    "/document": "Створення документа",
    "/payment": "Оплата",
  };
  if (exact[path]) return exact[path];
  const segments = path.split("/").filter(Boolean);
  if (segments[0] === "blog") return `Стаття: ${segments[1] ?? ""}`;
  if (segments[0] === "practices") return `Практика: ${segments[1] ?? ""}`;
  if (segments[0] === "services") return `Послуга: ${segments[1] ?? ""}`;
  if (segments[0] === "document") return `Документ: ${segments[1] ?? ""}`;
  return path;
}

export const DEVICE_LABELS: Record<string, string> = {
  desktop: "Комп'ютер",
  mobile: "Телефон",
  tablet: "Планшет",
  bot: "Бот",
};

/** Ключ дня у UTC для групування (YYYY-MM-DD). */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Масив останніх N днів (включно з сьогодні) у форматі YYYY-MM-DD. */
export function lastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(dayKey(d));
  }
  return days;
}
