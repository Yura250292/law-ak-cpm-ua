import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminResult } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return withAdminResult(async () => {
    const { id } = await params;
    await prisma.trustedSource.deleteMany({ where: { id } });
    return { ok: true };
  });
}
