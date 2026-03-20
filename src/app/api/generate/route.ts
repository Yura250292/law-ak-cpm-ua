import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { buildPrompt } from "@/lib/ai/prompt-builder";
import { generateLegalText } from "@/lib/ai/generate";

const generateBodySchema = z.object({
  documentRequestId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = generateBodySchema.safeParse(body);
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

    await prisma.documentRequest.update({
      where: { id: documentRequestId },
      data: { status: "GENERATING" },
    });

    // formData is stored in partyData (new structure)
    const formData = documentRequest.partyData as Record<string, any>;

    const prompt = buildPrompt({
      templateSlug: documentRequest.template.slug,
      templateTitle: documentRequest.template.title,
      promptHint: documentRequest.template.promptHint ?? "",
      formData,
    });

    const text = await generateLegalText(prompt);

    await prisma.documentRequest.update({
      where: { id: documentRequestId },
      data: { generatedText: text },
    });

    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Помилка генерації документа" },
      { status: 500 }
    );
  }
}
