import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import {
  analyzeLegalCase,
  analyzeLegalCaseWithImages,
} from "@/lib/ai/case-analyzer";
import { getObjectFromR2, deleteFromR2 } from "@/lib/r2";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
const DOC_EXTENSIONS = [".pdf", ".docx", ".txt"];

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

interface UploadedItem {
  buffer: Buffer;
  name: string;
}

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const r2KeysToCleanup: string[] = [];

  try {
    await requireAdmin();

    let lawyerTask: string | null = null;
    let pastedText: string | null = null;
    let mode: "synergy" | "gemini" | "claude" = "synergy";
    const items: UploadedItem[] = [];

    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      // R2-backed flow: client uploaded files directly to R2 and now sends keys.
      const body = (await request.json()) as {
        lawyerTask?: string;
        text?: string;
        files?: { key: string; name: string }[];
        mode?: "synergy" | "gemini" | "claude";
      };
      lawyerTask = body.lawyerTask ?? null;
      pastedText = body.text ?? null;
      if (body.mode === "gemini" || body.mode === "claude") mode = body.mode;

      const r2Files = body.files ?? [];
      for (const f of r2Files) {
        if (!f.key || !f.name) continue;
        const buffer = await getObjectFromR2(f.key);
        items.push({ buffer, name: f.name });
        r2KeysToCleanup.push(f.key);
      }
    } else {
      // Legacy FormData flow (small uploads, ≤ 4.5 MB Vercel cap).
      const formData = await request.formData();
      lawyerTask = formData.get("lawyerTask") as string | null;
      pastedText = formData.get("text") as string | null;

      const allFiles = formData.getAll("files") as File[];
      const singleFile = formData.get("file") as File | null;
      if (singleFile) allFiles.push(singleFile);

      for (const file of allFiles) {
        items.push({
          buffer: Buffer.from(await file.arrayBuffer()),
          name: file.name,
        });
      }
    }

    let documentText = "";
    const images: { mimeType: string; base64: string; fileName: string }[] = [];
    const fileNames: string[] = [];

    for (const item of items) {
      const buffer = item.buffer;
      const fileName = item.name.toLowerCase();
      fileNames.push(item.name);
      const file = { name: item.name } as { name: string };

      if (isImage(fileName)) {
        images.push({
          mimeType: getMimeType(fileName),
          base64: buffer.toString("base64"),
          fileName: file.name,
        });
      } else if (fileName.endsWith(".pdf")) {
        try {
          const pdfModule = await import("pdf-parse");
          const pdfParse = (pdfModule as any).default ?? pdfModule;
          const parsed = await pdfParse(buffer);
          documentText += parsed.text + "\n\n";
        } catch (err) {
          return NextResponse.json(
            {
              error: `Не вдалося прочитати PDF "${file.name}". Можливо файл пошкоджений, захищений паролем або містить тільки зображення. Спробуйте зберегти копію або завантажити як фото/JPG.`,
              details: err instanceof Error ? err.message : String(err),
            },
            { status: 400 }
          );
        }
      } else if (fileName.endsWith(".docx")) {
        try {
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ buffer });
          documentText += result.value + "\n\n";
        } catch (err) {
          return NextResponse.json(
            {
              error: `Не вдалося прочитати DOCX "${file.name}". Файл пошкоджений або не є валідним .docx. Відкрийте його у Word/Pages і збережіть як .docx, PDF або .txt.`,
              details: err instanceof Error ? err.message : String(err),
            },
            { status: 400 }
          );
        }
      } else if (fileName.endsWith(".doc")) {
        return NextResponse.json(
          {
            error: `Старий формат .doc не підтримується ("${file.name}"). Відкрийте файл у Word і збережіть як .docx або PDF.`,
          },
          { status: 400 }
        );
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

    // Call AI (Gemini draft + Claude review synergy, або один із моделей)
    const result =
      images.length > 0
        ? await analyzeLegalCaseWithImages({
            documentText: documentText.trim(),
            images,
            lawyerTask: lawyerTask?.trim() ?? "",
            mode,
          })
        : await analyzeLegalCase(
            documentText.trim(),
            lawyerTask?.trim() ?? "",
            mode
          );

    const displayName =
      fileNames.length > 0 ? fileNames.join(", ") : "Вставлений текст";

    return NextResponse.json({
      analysis: result.text,
      models: result.models,
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
  } finally {
    // Clean up R2 staging objects — analysis is one-shot, no reason to keep them.
    for (const key of r2KeysToCleanup) {
      deleteFromR2(key).catch((err) =>
        console.error(`R2 cleanup failed for ${key}:`, err)
      );
    }
  }
}
