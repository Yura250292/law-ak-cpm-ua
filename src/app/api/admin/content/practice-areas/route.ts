import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { withAdminResult, ApiError } from "@/lib/admin-api";
import { practiceAreaInputSchema } from "@/lib/validations/content";

export async function GET() {
  return withAdminResult(async () => {
    const items = await prisma.practiceArea.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return { items };
  });
}

export async function POST(request: NextRequest) {
  return withAdminResult(async () => {
    const parsed = practiceAreaInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Невалідні дані");
    }
    const data = parsed.data;

    const existing = await prisma.practiceArea.findUnique({
      where: { slug: data.slug },
    });
    if (existing) throw new ApiError(409, "Практика з таким slug вже існує");

    const item = await prisma.practiceArea.create({
      data: { ...data, process: data.process as unknown as object },
    });
    revalidatePath("/services");
    revalidatePath(`/practices/${item.slug}`);
    return { item };
  });
}
