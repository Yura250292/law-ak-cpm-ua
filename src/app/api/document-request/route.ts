import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { buildPrompt } from "@/lib/ai/prompt-builder";
import { generateLegalText } from "@/lib/ai/generate";
import { notifyLawyerNewRequest } from "@/lib/email/notify-lawyer";
import type { Prisma } from "@/generated/prisma/client";

const documentRequestBodySchema = z.object({
  templateId: z.string().min(1, "templateId є обов'язковим"),
  templateSlug: z.string().min(1, "templateSlug є обов'язковим"),
  formData: z.record(z.string(), z.unknown()),
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
      templateSlug,
      formData,
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

    // Extract plaintiff name from formData for user record
    const plaintiffData = formData["plaintiff"] as Record<string, string> | undefined;
    const plaintiffName = plaintiffData?.fullName
      ?? (formData["plaintiff.fullName"] as string)
      ?? "Користувач";

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

    // Store all formData in partyData, empty objects for compatibility
    const documentRequest = await prisma.documentRequest.create({
      data: {
        templateId,
        userId: user.id,
        status: "DRAFT",
        partyData: formData as Prisma.InputJsonValue,
        circumstancesData: {} as Prisma.InputJsonValue,
        requirementsData: {} as Prisma.InputJsonValue,
        contactEmail,
        contactPhone,
      },
    });

    // --- Generation Pipeline ---
    try {
      // 1. Build prompt
      const prompt = buildPrompt({
        templateSlug,
        templateTitle: template.title,
        promptHint: template.promptHint ?? "",
        formData: formData as Record<string, any>,
      });

      // 2. Generate AI text
      await prisma.documentRequest.update({
        where: { id: documentRequest.id },
        data: { status: "GENERATING" },
      });

      const generatedText = await generateLegalText(prompt);

      // 3. Update generatedText
      await prisma.documentRequest.update({
        where: { id: documentRequest.id },
        data: { generatedText },
      });

      // 4. Mark as PENDING_REVIEW (lawyer will review, edit, and approve)
      await prisma.documentRequest.update({
        where: { id: documentRequest.id },
        data: { status: "PENDING_REVIEW" },
      });

      // 5. Notify lawyer about new request (non-critical)
      try {
        await notifyLawyerNewRequest({
          requestId: documentRequest.id,
          documentTitle: template.title,
          clientEmail: contactEmail,
          clientName: plaintiffName,
        });
      } catch (notifyError) {
        console.error("Lawyer notification failed (non-critical):", notifyError);
      }

      return NextResponse.json({
        documentRequestId: documentRequest.id,
        status: "completed",
      });
    } catch (pipelineError) {
      console.error("Generation pipeline error:", pipelineError);

      // Mark as failed but still return the saved request
      await prisma.documentRequest.update({
        where: { id: documentRequest.id },
        data: { status: "FAILED" },
      }).catch(() => {});

      const errMsg = pipelineError instanceof Error ? pipelineError.message : String(pipelineError);
      return NextResponse.json({
        documentRequestId: documentRequest.id,
        status: "error",
        error: errMsg,
      });
    }
  } catch (error) {
    console.error("Failed to create document request:", error);
    return NextResponse.json(
      { error: "Не вдалося створити запит на документ" },
      { status: 500 }
    );
  }
}
