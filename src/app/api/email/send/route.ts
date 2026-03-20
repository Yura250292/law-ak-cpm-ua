import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { sendDocumentEmail } from "@/lib/email/send-document";

const sendEmailBodySchema = z.object({
  documentRequestId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = sendEmailBodySchema.safeParse(body);
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

    if (!documentRequest.pdfUrl) {
      return NextResponse.json(
        { error: "PDF документ ще не згенеровано" },
        { status: 400 }
      );
    }

    // Download PDF from R2
    const pdfResponse = await fetch(documentRequest.pdfUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.status}`);
    }

    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    const fileName = `${documentRequest.template.slug ?? documentRequest.template.title}-${documentRequestId}.pdf`;

    await sendDocumentEmail({
      to: documentRequest.contactEmail,
      documentTitle: documentRequest.template.title,
      pdfBuffer,
      fileName,
    });

    await prisma.documentRequest.update({
      where: { id: documentRequestId },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Помилка відправки email" },
      { status: 500 }
    );
  }
}
