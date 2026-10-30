import { NextRequest, NextResponse, after } from "next/server";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import { chatAboutCase, transcribeAttachment } from "@/lib/ai/case-analyzer";
import { getObjectFromR2, deleteFromR2 } from "@/lib/r2";
import { extractCaseFile, CaseFileError } from "@/lib/case-files";
import {
  appendToAnalysis,
  compactChatIfNeeded,
  loadChatSession,
} from "@/lib/case-analysis-history";

export const maxDuration = 300;

const DEFAULT_FILES_QUESTION =
  "Я додав(ла) нові документи до справи. Коротко: що в них (ключові факти, суми, дати) і як вони змінюють або доповнюють попередній аналіз?";

/**
 * Reads documents added in chat into plain text. Scanned PDFs / photos are
 * transcribed once, so the text can stay in the case context for every
 * following question without re-sending the files.
 */
async function readAddedFiles(files: { key: string; name: string }[]): Promise<string> {
  let out = "";
  for (const f of files) {
    const buffer = await getObjectFromR2(f.key);
    const extracted = await extractCaseFile({ buffer, name: f.name });
    let text = extracted.text.trim();
    if (extracted.attachment) {
      const transcribed = await transcribeAttachment(extracted.attachment);
      text = text ? `${transcribed}\n\n${text}` : transcribed;
    }
    out += `\n\n═══ ДОДАНИЙ ДОКУМЕНТ: ${f.name} ═══\n${text}`;
  }
  return out;
}

export async function POST(request: NextRequest) {
  const r2KeysToCleanup: string[] = [];

  try {
    await requireAdmin();

    const body = await request.json();
    const { caseContext, analysisResult, chatHistory, question } = body;
    // Saved session to append this turn to; documentType marks "generate document" requests.
    const analysisId: string | null =
      typeof body.analysisId === "string" ? body.analysisId : null;
    const documentType: string | null =
      typeof body.documentType === "string" ? body.documentType : null;
    const files: { key: string; name: string }[] = Array.isArray(body.files)
      ? body.files.filter((f: { key?: string; name?: string }) => f?.key && f?.name)
      : [];
    r2KeysToCleanup.push(...files.map((f) => f.key));

    if (!question?.trim() && files.length === 0) {
      return NextResponse.json(
        { error: "Введіть запитання" },
        { status: 400 }
      );
    }

    if (!caseContext?.trim() && !analysisResult?.trim() && files.length === 0) {
      return NextResponse.json(
        { error: "Відсутній контекст справи" },
        { status: 400 }
      );
    }

    let addedText = "";
    if (files.length > 0) {
      try {
        addedText = await readAddedFiles(files);
      } catch (err) {
        if (err instanceof CaseFileError) {
          return NextResponse.json(
            { error: err.message, details: err.details },
            { status: 400 }
          );
        }
        throw err;
      }
    }

    // A saved session is the source of truth: initial task, full case context,
    // summary of compacted turns and the rest of the dialogue. Without one
    // (DB unavailable) fall back to what the page sent.
    const session = analysisId ? await loadChatSession(analysisId) : null;
    const result = await chatAboutCase(
      session
        ? {
            caseContext: session.caseContext + addedText,
            analysisResult: session.analysis,
            lawyerTask: session.lawyerTask,
            summary: session.summary,
            chatHistory: session.recentMessages,
            question: question?.trim() || DEFAULT_FILES_QUESTION,
          }
        : {
            caseContext: (caseContext ?? "") + addedText,
            analysisResult: analysisResult ?? "",
            chatHistory: (chatHistory ?? []).slice(-20),
            question: question?.trim() || DEFAULT_FILES_QUESTION,
          }
    );

    if (analysisId) {
      const fileLine = files.length ? `📎 ${files.map((f) => f.name).join(", ")}` : "";
      await appendToAnalysis(analysisId, {
        addedText,
        ...(documentType
          ? {
              document: {
                type: documentType,
                text: result.text,
                createdAt: new Date().toISOString(),
              },
            }
          : {
              messages: [
                { role: "user", text: [fileLine, question?.trim()].filter(Boolean).join("\n") },
                { role: "assistant", text: result.text },
              ],
            }),
      });
      // Summarize old turns after the response is sent — the lawyer doesn't wait for it.
      if (!documentType) after(() => compactChatIfNeeded(analysisId));
    }

    // addedText goes back to the client, which appends it to caseContext.
    return NextResponse.json({ answer: result.text, model: result.model, addedText });
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
  } finally {
    // Added files are now text in the case context — no reason to keep them.
    for (const key of r2KeysToCleanup) {
      deleteFromR2(key).catch((err) =>
        console.error(`R2 cleanup failed for ${key}:`, err)
      );
    }
  }
}
