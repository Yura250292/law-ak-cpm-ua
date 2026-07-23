import { z } from "zod";

// Схема контент-блоків для статей блогу.
// Inline-посилання всередині paragraph/list/quote — markdown-токен [текст](url).

export const headingBlockSchema = z.object({
  id: z.string(),
  type: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3)]),
  text: z.string(),
});

export const paragraphBlockSchema = z.object({
  id: z.string(),
  type: z.literal("paragraph"),
  text: z.string(),
});

export const imageBlockSchema = z.object({
  id: z.string(),
  type: z.literal("image"),
  url: z.string(),
  alt: z.string().default(""),
  caption: z.string().optional(),
});

export const listBlockSchema = z.object({
  id: z.string(),
  type: z.literal("list"),
  style: z.union([z.literal("bullet"), z.literal("numbered")]),
  items: z.array(z.string()),
});

export const quoteBlockSchema = z.object({
  id: z.string(),
  type: z.literal("quote"),
  text: z.string(),
  cite: z.string().optional(),
});

export const buttonBlockSchema = z.object({
  id: z.string(),
  type: z.literal("button"),
  label: z.string(),
  url: z.string(),
  variant: z.union([z.literal("primary"), z.literal("outline")]),
});

export const blockSchema = z.discriminatedUnion("type", [
  headingBlockSchema,
  paragraphBlockSchema,
  imageBlockSchema,
  listBlockSchema,
  quoteBlockSchema,
  buttonBlockSchema,
]);

export const blocksSchema = z.array(blockSchema);

export type HeadingBlock = z.infer<typeof headingBlockSchema>;
export type ParagraphBlock = z.infer<typeof paragraphBlockSchema>;
export type ImageBlock = z.infer<typeof imageBlockSchema>;
export type ListBlock = z.infer<typeof listBlockSchema>;
export type QuoteBlock = z.infer<typeof quoteBlockSchema>;
export type ButtonBlock = z.infer<typeof buttonBlockSchema>;
export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block["type"];

export const BLOCK_LABELS: Record<BlockType, string> = {
  heading: "Заголовок",
  paragraph: "Текст",
  image: "Фото",
  list: "Список",
  quote: "Цитата",
  button: "Кнопка",
};

export const BLOCK_TYPES: BlockType[] = [
  "heading",
  "paragraph",
  "image",
  "list",
  "quote",
  "button",
];

/** Унікальний id для нового блока. Працює і в браузері, і на сервері. */
function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `b-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

/** Фабрика порожнього блока заданого типу. */
export function newBlock(type: BlockType): Block {
  const id = makeId();
  switch (type) {
    case "heading":
      return { id, type: "heading", level: 2, text: "" };
    case "paragraph":
      return { id, type: "paragraph", text: "" };
    case "image":
      return { id, type: "image", url: "", alt: "", caption: "" };
    case "list":
      return { id, type: "list", style: "bullet", items: [""] };
    case "quote":
      return { id, type: "quote", text: "", cite: "" };
    case "button":
      return { id, type: "button", label: "", url: "", variant: "primary" };
  }
}

/**
 * Безпечний парсинг blocks з БД/запиту. Невалідні дані → порожній масив;
 * окремі невалідні блоки пропускаються.
 */
export function parseBlocks(input: unknown): Block[] {
  if (!Array.isArray(input)) return [];
  const result: Block[] = [];
  for (const raw of input) {
    const parsed = blockSchema.safeParse(raw);
    if (parsed.success) result.push(parsed.data);
  }
  return result;
}

/** Приблизний час читання за кількістю слів у блоках (≈200 слів/хв). */
export function estimateReadTime(blocks: Block[]): string {
  let words = 0;
  for (const b of blocks) {
    if (b.type === "paragraph" || b.type === "heading" || b.type === "quote") {
      words += b.text.trim().split(/\s+/).filter(Boolean).length;
    } else if (b.type === "list") {
      words += b.items.join(" ").trim().split(/\s+/).filter(Boolean).length;
    }
  }
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} хв`;
}
