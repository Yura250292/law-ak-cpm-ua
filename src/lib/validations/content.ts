import { z } from "zod";
import { blocksSchema } from "@/lib/content-blocks";

const slugRegex = /^[a-z0-9-]+$/;

export const articleInputSchema = z.object({
  title: z.string().trim().min(1, "Вкажіть заголовок"),
  slug: z
    .string()
    .trim()
    .min(1, "Вкажіть slug")
    .regex(slugRegex, "Slug може містити лише латиницю, цифри та дефіс"),
  excerpt: z.string().trim().default(""),
  category: z.string().trim().default("Загальне"),
  author: z.string().trim().default("Кабаль Анастасія"),
  coverImage: z.string().trim().nullish(),
  readTime: z.string().trim().default("5 хв"),
  blocks: blocksSchema.default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export type ArticleInput = z.infer<typeof articleInputSchema>;

/** При публікації excerpt обовʼязковий. */
export function assertPublishable(input: ArticleInput): string | null {
  if (input.status === "PUBLISHED") {
    if (!input.excerpt) return "Для публікації потрібен короткий опис (excerpt)";
    if (input.blocks.length === 0) return "Додайте хоча б один блок контенту";
  }
  return null;
}

export const practiceAreaInputSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1).regex(slugRegex),
  shortDescription: z.string().trim().default(""),
  icon: z.string().trim().default("⚖️"),
  description: z.string().trim().default(""),
  services: z.array(z.string().trim()).default([]),
  advantages: z.array(z.string().trim()).default([]),
  process: z
    .array(
      z.object({
        step: z.number(),
        title: z.string(),
        description: z.string(),
      })
    )
    .default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  sortOrder: z.number().int().default(0),
});

export const reviewInputSchema = z.object({
  kind: z.enum(["review", "case"]).default("review"),
  name: z.string().trim().min(1),
  text: z.string().trim().min(1),
  result: z.string().trim().nullish(),
  rating: z.number().int().min(1).max(5).default(5),
  service: z.string().trim().default(""),
  photos: z.array(z.string().trim()).default([]),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  sortOrder: z.number().int().default(0),
});

export const sampleInputSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().default(""),
  fileUrl: z.string().trim().min(1),
  sizeLabel: z.string().trim().default(""),
  iconKey: z.string().trim().default("document"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  sortOrder: z.number().int().default(0),
});

export const certificateInputSchema = z.object({
  title: z.string().trim().min(1),
  imageUrl: z.string().trim().min(1),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  sortOrder: z.number().int().default(0),
});
