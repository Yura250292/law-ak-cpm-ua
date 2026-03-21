import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const documentRequest = await prisma.documentRequest.findUnique({
      where: { id },
      include: {
        template: true,
        payment: true,
      },
    });

    if (!documentRequest) {
      return NextResponse.json(
        { error: "Заявку не знайдено" },
        { status: 404 }
      );
    }

    return NextResponse.json(documentRequest);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};

    if (typeof body.generatedText === "string") {
      updateData.generatedText = body.generatedText;
    }
    if (typeof body.lawyerNotes === "string") {
      updateData.lawyerNotes = body.lawyerNotes;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Немає даних для оновлення" },
        { status: 400 }
      );
    }

    const updated = await prisma.documentRequest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 }
    );
  }
}
