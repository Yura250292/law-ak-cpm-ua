import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import { analyzeLegalCase } from "@/lib/ai/case-analyzer";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const pastedText = formData.get("text") as string | null;

    let documentText = "";

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith(".pdf")) {
        const pdfModule = await import("pdf-parse");
        const pdfParse = (pdfModule as any).default ?? pdfModule;
        const parsed = await pdfParse(buffer);
        documentText = parsed.text;
      } else if (
        fileName.endsWith(".docx") ||
        fileName.endsWith(".doc")
      ) {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        documentText = result.value;
      } else if (fileName.endsWith(".txt")) {
        documentText = buffer.toString("utf-8");
      } else {
        return NextResponse.json(
          { error: "Підтримуються формати: PDF, DOCX, DOC, TXT" },
          { status: 400 }
        );
      }
    } else if (pastedText?.trim()) {
      documentText = pastedText.trim();
    } else {
      return NextResponse.json(
        { error: "Завантажте файл або вставте текст справи" },
        { status: 400 }
      );
    }

    if (documentText.trim().length < 50) {
      return NextResponse.json(
        { error: "Текст документа занадто короткий для аналізу" },
        { status: 400 }
      );
    }

    const analysis = await analyzeLegalCase(documentText);

    return NextResponse.json({
      analysis,
      documentText: documentText.slice(0, 20000),
      fileName: file?.name ?? "Вставлений текст",
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Case analysis error:", error);
    return NextResponse.json(
      {
        error: "Помилка аналізу",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
