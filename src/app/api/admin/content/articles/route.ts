import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { withAdminResult, ApiError } from "@/lib/admin-api";
import { articleInputSchema, assertPublishable } from "@/lib/validations/content";

export async function GET() {
  return withAdminResult(async () => {
    const articles = await prisma.article.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        status: true,
        updatedAt: true,
        publishedAt: true,
      },
    });
    return { articles };
  });
}

export async function POST(request: NextRequest) {
  return withAdminResult(async () => {
    const body = await request.json();
    const parsed = articleInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Невалідні дані");
    }
    const data = parsed.data;

    const publishError = assertPublishable(data);
    if (publishError) throw new ApiError(400, publishError);

    const existing = await prisma.article.findUnique({
      where: { slug: data.slug },
    });
    if (existing) throw new ApiError(409, "Стаття з таким slug вже існує");

    const article = await prisma.article.create({
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
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${article.slug}`);
    return { article };
  });
}
