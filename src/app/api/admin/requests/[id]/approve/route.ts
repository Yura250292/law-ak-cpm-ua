import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import { generateDocumentPdf } from "@/lib/pdf/generate-pdf";
import { uploadToR2 } from "@/lib/r2";
import { sendDocumentEmail } from "@/lib/email/send-document";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

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

    if (!documentRequest.generatedText) {
      return NextResponse.json(
        { error: "Документ не має згенерованого тексту" },
        { status: 400 }
      );
    }

    // 1. Generate PDF from (possibly edited) text
    let pdfUrl: string | null = null;
    try {
      const pdfBuffer = await generateDocumentPdf(
        documentRequest.template.title,
        documentRequest.generatedText
      );
      const key = `documents/${documentRequest.id}.pdf`;
      pdfUrl = await uploadToR2(key, pdfBuffer, "application/pdf");
    } catch (pdfError) {
      console.error("PDF generation failed:", pdfError);
      return NextResponse.json(
        { error: "Помилка генерації PDF" },
        { status: 500 }
      );
    }

    // 2. Update status to COMPLETED
    await prisma.documentRequest.update({
      where: { id },
      data: { pdfUrl, status: "COMPLETED" },
    });

    // 3. Send email to client
    if (pdfUrl) {
      try {
        const pdfResponse = await fetch(pdfUrl);
        if (pdfResponse.ok) {
          const pdfArrayBuffer = await pdfResponse.arrayBuffer();
          const emailPdfBuffer = Buffer.from(pdfArrayBuffer);
          await sendDocumentEmail({
            to: documentRequest.contactEmail,
            documentTitle: documentRequest.template.title,
            pdfBuffer: emailPdfBuffer,
            fileName: `${documentRequest.template.slug}-${documentRequest.id}.pdf`,
          });
        }
      } catch (emailError) {
        console.error("Email send failed (non-critical):", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      status: "COMPLETED",
      pdfUrl,
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Approve error:", error);
    return NextResponse.json(
      { error: "Помилка затвердження" },
      { status: 500 }
    );
  }
}
