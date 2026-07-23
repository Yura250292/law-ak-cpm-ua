import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { withAdminResult, ApiError } from "@/lib/admin-api";
import { reviewInputSchema } from "@/lib/validations/content";

function revalidateReviews() {
  revalidatePath("/reviews");
  revalidatePath("/");
}

export async function GET() {
  return withAdminResult(async () => {
    const items = await prisma.review.findMany({
      orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return { items };
  });
}

export async function POST(request: NextRequest) {
  return withAdminResult(async () => {
    const parsed = reviewInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Невалідні дані");
    }
    const item = await prisma.review.create({ data: parsed.data });
    revalidateReviews();
    return { item };
  });
}
