import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { generateDocumentPdf } from "@/lib/pdf/generate-pdf";
import { uploadToR2 } from "@/lib/r2";

const pdfBodySchema = z.object({
  documentRequestId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = pdfBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Невірні дані", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { documentRequestId } = parsed.data;

    const documentRequest = await prisma.documentRequest.findUnique({
      where: { id: documentRequestId },
      include: { template: true },
    });

    if (!documentRequest) {
      return NextResponse.json(
        { error: "Запит на документ не знайдено" },
        { status: 404 }
      );
    }

    if (!documentRequest.generatedText) {
      return NextResponse.json(
        { error: "Текст документа ще не згенеровано" },
        { status: 400 }
      );
    }

    const pdfBuffer = await generateDocumentPdf(
      documentRequest.template.title,
      documentRequest.generatedText
    );

    const key = `documents/${documentRequestId}.pdf`;
    const pdfUrl = await uploadToR2(key, pdfBuffer, "application/pdf");

    await prisma.documentRequest.update({
      where: { id: documentRequestId },
      data: { pdfUrl },
    });

    return NextResponse.json({ success: true, pdfUrl });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Помилка генерації PDF" },
      { status: 500 }
    );
  }
}
