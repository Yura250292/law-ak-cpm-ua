import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const documentRequest = await prisma.documentRequest.findUnique({
    where: { id },
    include: { template: true },
  });

  if (!documentRequest) {
    return NextResponse.json({ error: "Не знайдено" }, { status: 404 });
  }

  return NextResponse.json({
    id: documentRequest.id,
    status: documentRequest.status,
    templateTitle: documentRequest.template.title,
    pdfUrl: documentRequest.pdfUrl,
    generatedText: documentRequest.generatedText,
    contactEmail: documentRequest.contactEmail,
  });
}
