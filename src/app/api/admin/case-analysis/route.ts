import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import {
  analyzeLegalCase,
  analyzeLegalCaseWithImages,
} from "@/lib/ai/case-analyzer";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
const DOC_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt"];

function isImage(name: string): boolean {
  return IMAGE_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext));
}

function getMimeType(name: string): string {
  const ext = name.toLowerCase().split(".").pop();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
  };
  return map[ext ?? ""] ?? "image/jpeg";
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const pastedText = formData.get("text") as string | null;

    // Collect all files
    const allFiles = formData.getAll("files") as File[];
    // Also support single "file" key for backwards compat
    const singleFile = formData.get("file") as File | null;
    if (singleFile) allFiles.push(singleFile);

    let documentText = "";
    const images: { mimeType: string; base64: string; fileName: string }[] = [];
    const fileNames: string[] = [];

    for (const file of allFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = file.name.toLowerCase();
      fileNames.push(file.name);

      if (isImage(fileName)) {
        // Image file — send to Gemini as inline data
        images.push({
          mimeType: getMimeType(fileName),
          base64: buffer.toString("base64"),
          fileName: file.name,
        });
      } else if (fileName.endsWith(".pdf")) {
        const pdfModule = await import("pdf-parse");
        const pdfParse = (pdfModule as any).default ?? pdfModule;
        const parsed = await pdfParse(buffer);
        documentText += parsed.text + "\n\n";
      } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        documentText += result.value + "\n\n";
      } else if (fileName.endsWith(".txt")) {
        documentText += buffer.toString("utf-8") + "\n\n";
      } else {
        return NextResponse.json(
          {
            error: `Непідтримуваний формат: ${file.name}. Підтримуються: PDF, DOCX, TXT, JPG, PNG, WEBP`,
          },
          { status: 400 }
        );
      }
    }

    // Add pasted text
    if (pastedText?.trim()) {
      documentText += pastedText.trim();
    }

    // Validate: need at least something
    if (!documentText.trim() && images.length === 0) {
      return NextResponse.json(
        { error: "Завантажте файли, фото або вставте текст справи" },
        { status: 400 }
      );
    }

    // If text-only and too short
    if (images.length === 0 && documentText.trim().length < 50) {
      return NextResponse.json(
        { error: "Текст документа занадто короткий для аналізу" },
        { status: 400 }
      );
    }

    // Call AI
    let analysis: string;

    if (images.length > 0) {
      analysis = await analyzeLegalCaseWithImages({
        documentText: documentText.trim(),
        images,
      });
    } else {
      analysis = await analyzeLegalCase(documentText.trim());
    }

    const displayName =
      fileNames.length > 0 ? fileNames.join(", ") : "Вставлений текст";

    return NextResponse.json({
      analysis,
      documentText: documentText.slice(0, 20000),
      fileName: displayName,
      imageCount: images.length,
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
