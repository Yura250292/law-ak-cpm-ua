import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { withAdminResult, ApiError } from "@/lib/admin-api";
import { sampleInputSchema } from "@/lib/validations/content";

export async function GET() {
  return withAdminResult(async () => {
    const items = await prisma.sample.findMany({ orderBy: { sortOrder: "asc" } });
    return { items };
  });
}

export async function POST(request: NextRequest) {
  return withAdminResult(async () => {
    const parsed = sampleInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Невалідні дані");
    }
    const item = await prisma.sample.create({ data: parsed.data });
    revalidatePath("/samples");
    return { item };
  });
}
