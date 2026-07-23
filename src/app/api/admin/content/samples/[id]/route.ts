import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { withAdminResult, ApiError } from "@/lib/admin-api";
import { sampleInputSchema } from "@/lib/validations/content";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const parsed = sampleInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Невалідні дані");
    }
    const current = await prisma.sample.findUnique({ where: { id } });
    if (!current) throw new ApiError(404, "Зразок не знайдено");
    const item = await prisma.sample.update({ where: { id }, data: parsed.data });
    revalidatePath("/samples");
    return { item };
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const current = await prisma.sample.findUnique({ where: { id } });
    if (!current) throw new ApiError(404, "Зразок не знайдено");
    await prisma.sample.delete({ where: { id } });
    revalidatePath("/samples");
    return { ok: true };
  });
}
