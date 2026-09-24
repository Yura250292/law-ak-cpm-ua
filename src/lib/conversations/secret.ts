import { timingSafeEqual } from "node:crypto";

/** Порівняння секретів з вебхуків без витоку через час відповіді. */
export function secretMatches(received: string | null, expected: string | undefined): boolean {
  if (!received || !expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
