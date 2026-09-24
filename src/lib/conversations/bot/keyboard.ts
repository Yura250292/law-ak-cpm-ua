/**
 * Розкладка inline-кнопок бота.
 *
 * Правила (так просив адвокат): не більше трьох кнопок у рядку; якщо остання
 * лишилась сама — вона на всю ширину; навігація «Назад / Головна» — завжди
 * окремим нижнім рядком.
 *
 * callback_data (≤ 64 байти):
 *   home · upload · years · y:2026 · mo:2026-09:<page> · c:<id> · tr:<id>:<page>
 *   ai · ai:new
 * Префікс «!» — відкрити екран новим повідомленням, а не редагувати поточне:
 * так кнопки під самарі чи відповіддю асистента не затирають сам текст.
 */

import type { InlineButton, InlineKeyboard } from "../telegram";

export const cb = (text: string, data: string): InlineButton => ({ text, callback_data: data });
export const link = (text: string, url: string): InlineButton => ({ text, url });

/**
 * Сітка: рядки по `perRow` (≤ 3). Залишок 1 → окремий рядок на всю ширину;
 * залишок 2 при perRow = 3 → рядок із двох.
 */
export function grid(buttons: InlineButton[], perRow: 1 | 2 | 3 = 3): InlineKeyboard {
  const rows: InlineKeyboard = [];
  for (let i = 0; i < buttons.length; i += perRow) rows.push(buttons.slice(i, i + perRow));
  return rows;
}

export const HOME = cb("🏠 Головна", "home");
export const back = (data: string) => cb("⬅️ Назад", data);

/** Нижній рядок навігації: «Назад» (якщо є куди) і «Головна». */
export function nav(backData?: string): InlineButton[] {
  return backData ? [back(backData), HOME] : [HOME];
}

/** Клавіатура = сітка + навігація окремим рядком. */
export function screen(rows: InlineKeyboard, backData?: string): InlineKeyboard {
  return [...rows, nav(backData)];
}

/** Для кнопок під повідомленнями-подіями: той самий екран, але новим повідомленням. */
export const fresh = (b: InlineButton): InlineButton =>
  b.callback_data ? { ...b, callback_data: `!${b.callback_data}` } : b;
