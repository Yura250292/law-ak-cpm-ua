import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import {
  generateAnalysisPdf,
  generateAnalysisDoc,
} from "@/lib/export/analysis-export";

type Format = "pdf" | "doc" | "txt";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { content, format, title } = (await request.json()) as {
      content?: string;
      format?: Format;
      title?: string;
    };

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Немає контенту для експорту" }, { status: 400 });
    }
    if (!format || !["pdf", "doc", "txt"].includes(format)) {
      return NextResponse.json({ error: "Невірний формат" }, { status: 400 });
    }

    const safeTitle = (title?.trim() || "Аналіз справи").slice(0, 120);
    const baseName = safeTitle
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, "_");

    if (format === "txt") {
      const plain = content.replace(/\*\*/g, "");
      return new NextResponse(plain, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(baseName)}.txt"`,
        },
      });
    }

    if (format === "doc") {
      const buf = generateAnalysisDoc(safeTitle, content);
      return new NextResponse(buf as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/msword",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(baseName)}.doc"`,
        },
      });
    }

    // PDF
    const buf = await generateAnalysisPdf(safeTitle, content);
    return new NextResponse(buf as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(baseName)}.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Export error:", error);
    return NextResponse.json(
      {
        error: "Помилка експорту",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
