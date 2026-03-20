import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const documentRequestBodySchema = z.object({
  templateId: z.string().min(1, "templateId є обов'язковим"),
  partyData: z.record(z.string(), z.unknown()),
  circumstancesData: z.record(z.string(), z.unknown()),
  requirementsData: z.record(z.string(), z.unknown()),
  contactEmail: z.string().email("Невірний формат email"),
  contactPhone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = documentRequestBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Невірні дані", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      templateId,
      partyData,
      circumstancesData,
      requirementsData,
      contactEmail,
      contactPhone,
    } = parsed.data;

    const template = await prisma.documentTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Шаблон не знайдено" },
        { status: 404 }
      );
    }

    const plaintiffName =
      (partyData as Record<string, Record<string, string>>)?.plaintiff
        ?.fullName ?? "Користувач";

    const user = await prisma.user.upsert({
      where: { email: contactEmail },
      update: {
        phone: contactPhone ?? undefined,
      },
      create: {
        email: contactEmail,
        name: plaintiffName,
        phone: contactPhone,
      },
    });

    const documentRequest = await prisma.documentRequest.create({
      data: {
        templateId,
        userId: user.id,
        status: "DRAFT",
        partyData: partyData as Prisma.InputJsonValue,
        circumstancesData: circumstancesData as Prisma.InputJsonValue,
        requirementsData: requirementsData as Prisma.InputJsonValue,
        contactEmail,
        contactPhone,
      },
    });

    return NextResponse.json({
      documentRequestId: documentRequest.id,
      templatePrice: template.price,
    });
  } catch (error) {
    console.error("Failed to create document request:", error);
    return NextResponse.json(
      { error: "Не вдалося створити запит на документ" },
      { status: 500 }
    );
  }
}
