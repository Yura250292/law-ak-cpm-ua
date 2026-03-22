import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import { chatAboutCase } from "@/lib/ai/case-analyzer";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { caseContext, analysisResult, chatHistory, question } = body;

    if (!question?.trim()) {
      return NextResponse.json(
        { error: "Введіть запитання" },
        { status: 400 }
      );
    }

    if (!caseContext?.trim() && !analysisResult?.trim()) {
      return NextResponse.json(
        { error: "Відсутній контекст справи" },
        { status: 400 }
      );
    }

    const answer = await chatAboutCase({
      caseContext: caseContext ?? "",
      analysisResult: analysisResult ?? "",
      chatHistory: chatHistory ?? [],
      question: question.trim(),
    });

    return NextResponse.json({ answer });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Case chat error:", error);
    return NextResponse.json(
      {
        error: "Помилка відповіді",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
