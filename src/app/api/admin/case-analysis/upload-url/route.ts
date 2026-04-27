import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import { getPresignedPutUrl } from "@/lib/r2";

const ALLOWED_EXT = [
  ".pdf",
  ".docx",
  ".doc",
  ".rtf",
  ".txt",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
];

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  rtf: "application/rtf",
  txt: "text/plain",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { fileName, contentType } = (await request.json()) as {
      fileName?: string;
      contentType?: string;
    };

    if (!fileName) {
      return NextResponse.json({ error: "fileName required" }, { status: 400 });
    }

    const lower = fileName.toLowerCase();
    if (!ALLOWED_EXT.some((ext) => lower.endsWith(ext))) {
      return NextResponse.json(
        { error: `Непідтримуваний формат: ${fileName}` },
        { status: 400 }
      );
    }

    const ext = lower.split(".").pop() ?? "";
    const safeContentType =
      contentType && contentType.length < 200
        ? contentType
        : MIME_BY_EXT[ext] ?? "application/octet-stream";

    const random = Math.random().toString(36).slice(2, 10);
    const safeBase = fileName
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .slice(0, 80);
    const key = `case-analysis/${Date.now()}-${random}-${safeBase}`;

    const url = await getPresignedPutUrl(key, safeContentType, 600);

    return NextResponse.json({ url, key, contentType: safeContentType });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Presign error:", error);
    return NextResponse.json(
      {
        error: "Не вдалося отримати URL для завантаження",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
