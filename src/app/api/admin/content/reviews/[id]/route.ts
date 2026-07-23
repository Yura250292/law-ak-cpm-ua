import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { withAdminResult, ApiError } from "@/lib/admin-api";
import { reviewInputSchema } from "@/lib/validations/content";

interface Params {
  params: Promise<{ id: string }>;
}

function revalidateReviews() {
  revalidatePath("/reviews");
  revalidatePath("/");
}

export async function PUT(request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const parsed = reviewInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Невалідні дані");
    }
    const current = await prisma.review.findUnique({ where: { id } });
    if (!current) throw new ApiError(404, "Запис не знайдено");
    const item = await prisma.review.update({ where: { id }, data: parsed.data });
    revalidateReviews();
    return { item };
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const current = await prisma.review.findUnique({ where: { id } });
    if (!current) throw new ApiError(404, "Запис не знайдено");
    await prisma.review.delete({ where: { id } });
    revalidateReviews();
    return { ok: true };
  });
}
