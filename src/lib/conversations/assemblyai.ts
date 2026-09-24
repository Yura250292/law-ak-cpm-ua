/**
 * Розпізнавання мовлення — AssemblyAI, звичайним fetch.
 *
 * Провайдер і налаштування ті самі, що в Metrum і Budvik (src/lib/meetings/
 * assemblyai.ts): модель universal, українська явно (автовизначення калічить
 * змішану розмову UA/RU), розділення спікерів, іменовані сутності.
 *
 * Відмінність: на Vercel немає воркера, тож результат не опитуємо, а просимо
 * AssemblyAI постукати у вебхук (/api/webhooks/assemblyai) із секретним
 * заголовком. Опитування лишається запасним шляхом — reconcile() у process.ts.
 */

import { ProviderError, asProviderError, classifyHttp } from "./errors";
import { formatClock, type Utterance } from "./types";

const BASE = "https://api.assemblyai.com/v2";
const SERVICE = "AssemblyAI";
const CALL_TIMEOUT_MS = 30_000;

/** Заголовок, яким AssemblyAI підписує вебхук. */
export const WEBHOOK_AUTH_HEADER = "x-webhook-secret";

export function assemblyConfigured(): boolean {
  return !!process.env.ASSEMBLYAI_API_KEY;
}

async function call<T>(path: string, method: "GET" | "POST" | "DELETE", body?: unknown): Promise<T> {
  const key = process.env.ASSEMBLYAI_API_KEY;
  if (!key) throw new ProviderError("ASSEMBLYAI_API_KEY не задано", "fatal");

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: { authorization: key, "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
    });
  } catch (e) {
    throw asProviderError(e, SERVICE);
  }

  const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok) {
    const message = data?.error || `HTTP ${res.status}`;
    throw new ProviderError(`${SERVICE}: ${message}`, classifyHttp(res.status, message), res.status);
  }
  return data as T;
}

/** Параметри, без яких розпізнавання все одно корисне. */
const OPTIONAL_PARAMS = ["entity_detection", "word_boost", "boost_param"] as const;

/**
 * Поставити запис у розпізнавання. Повертає id транскрипту.
 *
 * `audioUrl` — підписане посилання на об'єкт у приватному R2: AssemblyAI
 * забирає файл за секунди після запиту, тож посилання живе недовго.
 *
 * Якщо служба відповіла 400 і назвала необов'язковий параметр — повторюємо
 * один раз без них: запис без словника кращий за розмову без тексту.
 */
export async function submitTranscript(input: {
  audioUrl: string;
  webhookUrl: string | null;
  wordBoost: string[];
}): Promise<{ id: string; dropped: string[] }> {
  const secret = process.env.ASSEMBLYAI_WEBHOOK_SECRET;
  const body: Record<string, unknown> = {
    audio_url: input.audioUrl,
    speech_models: ["universal"],
    language_code: "uk",
    speaker_labels: true,
    entity_detection: true,
    ...(input.wordBoost.length > 0 ? { word_boost: input.wordBoost, boost_param: "high" } : {}),
    ...(input.webhookUrl && secret
      ? {
          webhook_url: input.webhookUrl,
          webhook_auth_header_name: WEBHOOK_AUTH_HEADER,
          webhook_auth_header_value: secret,
        }
      : {}),
  };

  try {
    const r = await call<{ id: string }>("/transcript", "POST", body);
    return { id: r.id, dropped: [] };
  } catch (e) {
    if (!(e instanceof ProviderError) || e.status !== 400) throw e;
    if (!/entity|word_boost|boost_param|keyterm/i.test(e.message)) throw e;
    const dropped = OPTIONAL_PARAMS.filter((k) => k in body);
    for (const k of dropped) delete body[k];
    const r = await call<{ id: string }>("/transcript", "POST", body);
    return { id: r.id, dropped: [...dropped] };
  }
}

type RawTranscript = {
  id: string;
  status: "queued" | "processing" | "completed" | "error";
  error?: string | null;
  text?: string | null;
  /** Секунди. */
  audio_duration?: number | null;
  utterances?: { speaker: string; start: number; end: number; text: string }[] | null;
};

export type TranscriptResult = {
  status: RawTranscript["status"];
  error: string | null;
  text: string | null;
  utterances: Utterance[];
  audioDurationMs: number | null;
};

export async function getTranscript(id: string): Promise<TranscriptResult> {
  const raw = await call<RawTranscript>(`/transcript/${encodeURIComponent(id)}`, "GET");
  const durationMs =
    typeof raw.audio_duration === "number" ? Math.round(raw.audio_duration * 1000) : null;

  // Слова з таймінгами не зберігаємо: це в рази більше за текст, а сторінці
  // розмови вистачає реплік.
  let utterances: Utterance[] = (raw.utterances ?? [])
    .filter((u) => u && typeof u.text === "string" && u.text.trim())
    .map((u) => ({
      speaker: String(u.speaker ?? "A"),
      start: u.start ?? 0,
      end: u.end ?? 0,
      text: u.text.trim(),
    }));

  // Розділення спікерів не вдалося, а текст є — одна репліка на весь запис.
  if (utterances.length === 0 && raw.text?.trim()) {
    utterances = [{ speaker: "A", start: 0, end: durationMs ?? 0, text: raw.text.trim() }];
  }

  return {
    status: raw.status,
    error: raw.error ?? null,
    text: raw.text ?? null,
    utterances,
    audioDurationMs: durationMs,
  };
}

/**
 * Помилка самого розпізнавання: не скачав файл — повтор має сенс; у записі
 * немає мовлення — ні.
 */
export function transcriptErrorKind(message: string): "retry" | "fatal" {
  if (/download|fetch|timeout|unavailable|temporar/i.test(message)) return "retry";
  if (
    /no spoken audio|does not appear to contain audio|too short|no audio|unsupported|invalid audio|transcod/i.test(
      message
    )
  ) {
    return "fatal";
  }
  return "retry";
}

/** Прибрати транскрипт в AssemblyAI (адвокатська таємниця). Не кидає. */
export async function deleteTranscript(id: string): Promise<void> {
  try {
    await call(`/transcript/${encodeURIComponent(id)}`, "DELETE");
  } catch (e) {
    console.warn(
      "[conversations] не вдалося видалити транскрипт в AssemblyAI:",
      e instanceof Error ? e.message : e
    );
  }
}

/** «Speaker A [12:34]: текст», порожній рядок між репліками — так читає і модель, і людина. */
export function renderTranscript(utterances: Utterance[]): string {
  return utterances.map((u) => `Speaker ${u.speaker} [${formatClock(u.start)}]: ${u.text}`).join("\n\n");
}
