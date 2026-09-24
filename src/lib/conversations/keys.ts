/**
 * Аудіо розмов у приватному R2: які файли приймаємо і під яким ключем кладемо.
 *
 * Чистий модуль (читає й форма завантаження). Список форматів — з Budvik/Metrum,
 * де його набирали по скаргах: m4a з айфона, amr і 3gp з андроїдів, opus/ogg із
 * Telegram.
 */

/** Ліміт для завантаження в адмінці. Bot API сам по собі віддає лише до 20 МБ. */
export const MAX_AUDIO_BYTES = 500 * 1024 * 1024;
export const TELEGRAM_MAX_BYTES = 20 * 1024 * 1024;

export const AUDIO_EXTENSIONS = [
  "mp3",
  "mp4",
  "m4a",
  "mpeg",
  "mpga",
  "wav",
  "webm",
  "ogg",
  "oga",
  "flac",
  "aac",
  "opus",
  "amr",
  "3gp",
] as const;

/** Для атрибута accept у виборі файлу. */
export const AUDIO_ACCEPT = [
  "audio/*",
  "video/mp4",
  "video/webm",
  "video/3gpp",
  ...AUDIO_EXTENSIONS.map((e) => `.${e}`),
].join(",");

function extOf(fileName: string): string {
  const m = /\.([a-z0-9]{2,5})$/i.exec(fileName.trim());
  return m ? m[1].toLowerCase() : "";
}

/**
 * Чи це аудіо. Телефони позначають m4a як video/mp4, а файл із месенджера
 * приходить як application/octet-stream — тому дивимось і на розширення.
 */
export function isAcceptableAudio(contentType: string, fileName: string): boolean {
  const mime = contentType.toLowerCase().split(";")[0].trim();
  if (mime.startsWith("audio/")) return true;
  if (mime === "video/mp4" || mime === "video/webm" || mime === "video/3gpp") return true;
  return (AUDIO_EXTENSIONS as readonly string[]).includes(extOf(fileName));
}

/** Розширення для ключа: з назви файлу, а без неї — з MIME. */
export function extensionFor(fileName: string, contentType: string): string {
  const fromName = extOf(fileName);
  if ((AUDIO_EXTENSIONS as readonly string[]).includes(fromName)) return fromName;
  const mime = contentType.toLowerCase();
  if (mime.includes("webm")) return "webm";
  if (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")) return "m4a";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  if (mime.includes("ogg") || mime.includes("opus")) return "ogg";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("amr")) return "amr";
  return "bin";
}

/** conversations/<id>/<ts>-<uuid>.<ext> — ключ невгадуваний. */
export function audioKey(conversationId: string, fileName: string, contentType: string): string {
  const rand = globalThis.crypto.randomUUID();
  return `conversations/${conversationId}/${Date.now()}-${rand}.${extensionFor(fileName, contentType)}`;
}

/** Ключ справді цієї розмови — щоб у complete-upload не підсунули чужий об'єкт. */
export function isConversationKey(conversationId: string, key: string): boolean {
  return (
    key.startsWith(`conversations/${conversationId}/`) && !key.includes("..") && !key.includes("//")
  );
}

/** Обрізає MIME до форми, яку приймає підпис R2: без параметрів і пробілів. */
export function normalizeContentType(contentType: string): string {
  const mime = contentType.toLowerCase().split(";")[0].trim();
  return /^[a-z0-9.+-]+\/[a-z0-9.+-]+$/.test(mime) ? mime : "application/octet-stream";
}
