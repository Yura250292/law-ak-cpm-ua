/**
 * Помилки зовнішніх служб (AssemblyAI, Claude, Telegram) з відповіддю на одне
 * питання: що робити далі. Перенесено з Budvik (src/lib/meetings/errors.ts).
 *
 * - transient: мережа, тайм-аут, 429, 5xx — служба лежить, запис ні в чому не
 *   винен; повтор має сенс.
 * - retry: служба відповіла по суті, але невдало; повтор може допомогти.
 * - fatal: повтор нічого не змінить (у записі немає мовлення, ключ відкликано,
 *   вичерпано баланс).
 */

export type ProviderErrorKind = "transient" | "retry" | "fatal";

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly kind: ProviderErrorKind,
    readonly status?: number
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export function classifyHttp(status: number, message: string): ProviderErrorKind {
  if (status === 429 && /quota|billing|insufficient|credit/i.test(message)) return "fatal";
  if (status === 408 || status === 409 || status === 429 || status >= 500) return "transient";
  if (status === 401 || status === 403) return "fatal";
  return "retry";
}

export function asProviderError(e: unknown, service: string): ProviderError {
  if (e instanceof ProviderError) return e;
  const name = e instanceof Error ? e.name : "";
  if (name === "AbortError" || name === "TimeoutError") {
    return new ProviderError(`${service}: не відповів вчасно`, "transient");
  }
  // Node кидає TypeError("fetch failed") на розрив з'єднання і DNS.
  if (e instanceof TypeError) {
    return new ProviderError(`${service}: немає зв'язку (${e.message})`, "transient");
  }
  return new ProviderError(`${service}: ${e instanceof Error ? e.message : String(e)}`, "retry");
}

/** Текст помилки для людини — у картку розмови і в Telegram. */
export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
