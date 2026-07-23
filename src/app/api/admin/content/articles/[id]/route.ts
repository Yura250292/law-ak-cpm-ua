import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { withAdminResult, ApiError } from "@/lib/admin-api";
import { articleInputSchema, assertPublishable } from "@/lib/validations/content";
import { parseBlocks } from "@/lib/content-blocks";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) throw new ApiError(404, "Статтю не знайдено");
    return { article: { ...article, blocks: parseBlocks(article.blocks) } };
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const body = await request.json();
    const parsed = articleInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Невалідні дані");
    }
    const data = parsed.data;

    const publishError = assertPublishable(data);
    if (publishError) throw new ApiError(400, publishError);

    const current = await prisma.article.findUnique({ where: { id } });
    if (!current) throw new ApiError(404, "Статтю не знайдено");

    // slug має лишатись унікальним серед інших статей
    const slugTaken = await prisma.article.findFirst({
      where: { slug: data.slug, id: { not: id } },
    });
    if (slugTaken) throw new ApiError(409, "Стаття з таким slug вже існує");

    // publishedAt проставляється при першій публікації
    const publishedAt =
      data.status === "PUBLISHED"
        ? current.publishedAt ?? new Date()
        : current.publishedAt;

    const article = await prisma.article.update({
      where: { id },
      data: {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        category: data.category,
        author: data.author,
        coverImage: data.coverImage ?? null,
        readTime: data.readTime,
        blocks: data.blocks as unknown as object,
        status: data.status,
        publishedAt,
      },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${article.slug}`);
    if (current.slug !== article.slug) revalidatePath(`/blog/${current.slug}`);
    return { article };
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) throw new ApiError(404, "Статтю не знайдено");
    await prisma.article.delete({ where: { id } });
    revalidatePath("/blog");
    revalidatePath(`/blog/${article.slug}`);
    return { ok: true };
  });
}
