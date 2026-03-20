import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { buildPrompt } from "@/lib/ai/prompt-builder";
import { generateLegalText } from "@/lib/ai/generate";
import { generateDocumentPdf } from "@/lib/pdf/generate-pdf";
import { uploadToR2 } from "@/lib/r2";
import { sendDocumentEmail } from "@/lib/email/send-document";
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

      // 4. Generate PDF
      const pdfBuffer = await generateDocumentPdf(
        template.title,
        generatedText
      );

      // 5. Upload to R2
      const key = `documents/${documentRequest.id}.pdf`;
      const pdfUrl = await uploadToR2(key, pdfBuffer, "application/pdf");

      // 6. Update pdfUrl, status = COMPLETED
      await prisma.documentRequest.update({
        where: { id: documentRequest.id },
        data: { pdfUrl, status: "COMPLETED" },
      });

      // 7. Try to send email (don't fail if email fails)
      try {
        const pdfResponse = await fetch(pdfUrl);
        if (pdfResponse.ok) {
          const pdfArrayBuffer = await pdfResponse.arrayBuffer();
          const emailPdfBuffer = Buffer.from(pdfArrayBuffer);
          const fileName = `${template.slug ?? template.title}-${documentRequest.id}.pdf`;

          await sendDocumentEmail({
            to: contactEmail,
            documentTitle: template.title,
            pdfBuffer: emailPdfBuffer,
            fileName,
          });
        }
      } catch (emailError) {
        console.error("Email sending failed (non-critical):", emailError);
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

      return NextResponse.json({
        documentRequestId: documentRequest.id,
        status: "error",
        error: "Помилка генерації документа",
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
