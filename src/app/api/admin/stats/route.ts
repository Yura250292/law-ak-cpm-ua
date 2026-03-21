import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();

    const [total, pendingReview, completed, revenue] = await Promise.all([
      prisma.documentRequest.count(),
      prisma.documentRequest.count({
        where: { status: "PENDING_REVIEW" },
      }),
      prisma.documentRequest.count({
        where: { status: "COMPLETED" },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS" },
      }),
    ]);

    return NextResponse.json({
      total,
      pendingReview,
      completed,
      revenue: revenue._sum.amount ?? 0,
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Помилка сервера", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
