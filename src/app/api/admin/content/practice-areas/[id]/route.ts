import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { withAdminResult, ApiError } from "@/lib/admin-api";
import { practiceAreaInputSchema } from "@/lib/validations/content";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const item = await prisma.practiceArea.findUnique({ where: { id } });
    if (!item) throw new ApiError(404, "Практику не знайдено");
    return { item };
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const parsed = practiceAreaInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Невалідні дані");
    }
    const data = parsed.data;

    const current = await prisma.practiceArea.findUnique({ where: { id } });
    if (!current) throw new ApiError(404, "Практику не знайдено");

    const slugTaken = await prisma.practiceArea.findFirst({
      where: { slug: data.slug, id: { not: id } },
    });
    if (slugTaken) throw new ApiError(409, "Практика з таким slug вже існує");

    const item = await prisma.practiceArea.update({
      where: { id },
      data: { ...data, process: data.process as unknown as object },
    });
    revalidatePath("/services");
    revalidatePath(`/practices/${item.slug}`);
    if (current.slug !== item.slug) revalidatePath(`/practices/${current.slug}`);
    return { item };
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const item = await prisma.practiceArea.findUnique({ where: { id } });
    if (!item) throw new ApiError(404, "Практику не знайдено");
    await prisma.practiceArea.delete({ where: { id } });
    revalidatePath("/services");
    revalidatePath(`/practices/${item.slug}`);
    return { ok: true };
  });
}
