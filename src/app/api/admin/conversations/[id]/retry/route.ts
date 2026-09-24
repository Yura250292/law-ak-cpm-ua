import { NextRequest, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminResult, ApiError } from "@/lib/admin-api";
import { retry } from "@/lib/conversations/process";

export const maxDuration = 300;

interface Params {
  params: Promise<{ id: string }>;
}

/** «Повторити обробку» / «Перескласти самарі». Сама робота — в after(), сторінка опитує статус. */
export async function POST(_request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const row = await prisma.conversation.findUnique({ where: { id }, select: { status: true } });
    if (!row) throw new ApiError(404, "Розмову не знайдено");
    if (row.status !== "FAILED" && row.status !== "READY") {
      throw new ApiError(409, "Розмова ще обробляється");
    }
    after(() => retry(id));
    return { ok: true };
  });
}
