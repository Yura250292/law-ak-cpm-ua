import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import {
  analyzeLegalCase,
  analyzeLegalCaseWithImages,
  CASE_CONTEXT_MAX_CHARS,
} from "@/lib/ai/case-analyzer";
import { getObjectFromR2, deleteFromR2 } from "@/lib/r2";
import {
  extractCaseFile,
  CaseFileError,
  type CaseAttachment,
  type UploadedItem,
} from "@/lib/case-files";
import { saveAnalysis } from "@/lib/case-analysis-history";

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
    const images: CaseAttachment[] = [];
    const fileNames: string[] = [];

    for (const item of items) {
      fileNames.push(item.name);
      let extracted;
      try {
        extracted = await extractCaseFile(item);
      } catch (err) {
        if (err instanceof CaseFileError) {
          return NextResponse.json(
            { error: err.message, details: err.details },
            { status: 400 }
          );
        }
        throw err;
      }
      if (extracted.attachment) images.push(extracted.attachment);
      if (extracted.text.trim()) documentText += extracted.text + "\n\n";
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

    const caseContext = documentText.slice(0, CASE_CONTEXT_MAX_CHARS);
    const analysisId = await saveAnalysis({
      fileNames,
      lawyerTask: lawyerTask?.trim() ?? "",
      mode,
      models: result.models,
      analysis: result.text,
      caseContext,
    });

    return NextResponse.json({
      analysisId,
      analysis: result.text,
      models: result.models,
      documentText: caseContext,
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
