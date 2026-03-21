import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import { generateDocumentPdf } from "@/lib/pdf/generate-pdf";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    // Accept optional text override from body
    let textOverride: string | null = null;
    try {
      const body = await request.json();
      if (typeof body.generatedText === "string" && body.generatedText.trim()) {
        textOverride = body.generatedText;
      }
    } catch {
      // No body or invalid JSON — use saved text
    }

    const documentRequest = await prisma.documentRequest.findUnique({
      where: { id },
      include: { template: true },
    });

    if (!documentRequest) {
      return NextResponse.json(
        { error: "Заявку не знайдено" },
        { status: 404 }
      );
    }

    const text = textOverride ?? documentRequest.generatedText;

    if (!text) {
      return NextResponse.json(
        { error: "Документ не має тексту для формування" },
        { status: 400 }
      );
    }

    // Save text if it was overridden
    if (textOverride) {
      await prisma.documentRequest.update({
        where: { id },
        data: { generatedText: textOverride },
      });
    }

    const pdfBuffer = await generateDocumentPdf(
      documentRequest.template.title,
      text
    );

    const fileName = `${documentRequest.template.slug}-${id}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("PDF generation error:", error);
    return NextResponse.json(
      {
        error: "Помилка генерації PDF",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
