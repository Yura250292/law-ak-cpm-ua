import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import { getPresignedPutUrl } from "@/lib/r2";

const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const FILE_EXT = [".pdf"];

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { fileName, contentType, kind } = (await request.json()) as {
      fileName?: string;
      contentType?: string;
      kind?: string;
    };

    if (!fileName) {
      return NextResponse.json({ error: "fileName required" }, { status: 400 });
    }

    // Для зразків дозволяємо ще й .pdf; для решти — лише зображення.
    const allowed =
      kind === "sample-file" ? [...IMAGE_EXT, ...FILE_EXT] : IMAGE_EXT;

    const lower = fileName.toLowerCase();
    if (!allowed.some((ext) => lower.endsWith(ext))) {
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
    const safeBase = fileName.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
    const year = new Date().getFullYear();
    const key = `content/${year}/${Date.now()}-${random}-${safeBase}`;

    const url = await getPresignedPutUrl(key, safeContentType, 600);
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ url, key, publicUrl, contentType: safeContentType });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Presign error:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати URL для завантаження" },
      { status: 500 }
    );
  }
}
