import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import type { DocumentRequestStatus } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as DocumentRequestStatus | null;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = 20;

    const where = status ? { status } : {};

    const [requests, count] = await Promise.all([
      prisma.documentRequest.findMany({
        where,
        include: {
          template: { select: { title: true, slug: true, category: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.documentRequest.count({ where }),
    ]);

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Admin requests error:", error);
    return NextResponse.json(
      { error: "Помилка сервера", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
