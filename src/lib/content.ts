import { prisma } from "@/lib/prisma";
import { parseBlocks, type Block } from "@/lib/content-blocks";

// Шар читання контенту з БД для публічних сторінок (server components).

export interface ArticleData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  coverImage: string | null;
  readTime: string;
  blocks: Block[];
  publishedAt: Date | null;
  createdAt: Date;
}

function toArticleData(a: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  coverImage: string | null;
  readTime: string;
  blocks: unknown;
  publishedAt: Date | null;
  createdAt: Date;
}): ArticleData {
  return { ...a, blocks: parseBlocks(a.blocks) };
}

export async function getPublishedArticles(): Promise<ArticleData[]> {
  const rows = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toArticleData);
}

export async function getArticleBySlug(slug: string): Promise<ArticleData | null> {
  const a = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
  return a ? toArticleData(a) : null;
}

export async function getRelatedArticles(
  slug: string,
  category: string,
  limit = 3
): Promise<ArticleData[]> {
  const rows = await prisma.article.findMany({
    where: { status: "PUBLISHED", category, slug: { not: slug } },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  return rows.map(toArticleData);
}

export async function getPracticeAreas() {
  return prisma.practiceArea.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPracticeAreaBySlug(slug: string) {
  return prisma.practiceArea.findFirst({ where: { slug, status: "PUBLISHED" } });
}

export async function getReviews() {
  return prisma.review.findMany({
    where: { status: "PUBLISHED", kind: "review" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getFeaturedReviews(limit = 3) {
  return prisma.review.findMany({
    where: { status: "PUBLISHED", kind: "review", featured: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getCases() {
  return prisma.review.findMany({
    where: { status: "PUBLISHED", kind: "case" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getSamples() {
  return prisma.sample.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCertificates() {
  return prisma.certificate.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
  });
}
