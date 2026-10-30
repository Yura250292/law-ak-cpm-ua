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

export async function DELETE(_request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    await prisma.caseAnalysis.deleteMany({ where: { id } });
    return { ok: true };
  });
}
