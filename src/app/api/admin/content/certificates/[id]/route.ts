import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { withAdminResult, ApiError } from "@/lib/admin-api";
import { certificateInputSchema } from "@/lib/validations/content";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const parsed = certificateInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Невалідні дані");
    }
    const current = await prisma.certificate.findUnique({ where: { id } });
    if (!current) throw new ApiError(404, "Сертифікат не знайдено");
    const item = await prisma.certificate.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/about");
    return { item };
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const current = await prisma.certificate.findUnique({ where: { id } });
    if (!current) throw new ApiError(404, "Сертифікат не знайдено");
    await prisma.certificate.delete({ where: { id } });
    revalidatePath("/about");
    return { ok: true };
  });
}
