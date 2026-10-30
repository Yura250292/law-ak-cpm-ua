import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminResult, ApiError } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const item = await prisma.caseAnalysis.findUnique({ where: { id } });
    if (!item) throw new ApiError(404, "Аналіз не знайдено");
    return { item };
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    const body = (await request.json()) as { title?: unknown };
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : "";
    if (!title) throw new ApiError(400, "Назва не може бути порожньою");
    const { count } = await prisma.caseAnalysis.updateMany({ where: { id }, data: { title } });
    if (!count) throw new ApiError(404, "Аналіз не знайдено");
    return { ok: true, title };
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    await prisma.caseAnalysis.deleteMany({ where: { id } });
    return { ok: true };
  });
}
