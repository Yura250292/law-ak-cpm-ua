import { prisma } from "@/lib/prisma";
import { CASE_CONTEXT_MAX_CHARS } from "@/lib/ai/case-analyzer";

export interface StoredMessage {
  role: "user" | "assistant";
  text: string;
}

export interface StoredDocument {
  type: string;
  text: string;
  createdAt: string;
}

function makeTitle(fileNames: string[], lawyerTask: string): string {
  const base =
    fileNames.join(", ") || lawyerTask.replace(/\s+/g, " ").trim() || "Вставлений текст";
  return base.length > 120 ? base.slice(0, 117) + "…" : base;
}

/** Saves a finished analysis. Returns null if the DB is unavailable — the lawyer still gets the result. */
export async function saveAnalysis(params: {
  fileNames: string[];
  lawyerTask: string;
  mode: string;
  models: string[];
  analysis: string;
  caseContext: string;
}): Promise<string | null> {
  try {
    const row = await prisma.caseAnalysis.create({
      data: {
        title: makeTitle(params.fileNames, params.lawyerTask),
        lawyerTask: params.lawyerTask || null,
        fileNames: params.fileNames,
        mode: params.mode,
        models: params.models,
        analysis: params.analysis,
        caseContext: params.caseContext.slice(0, CASE_CONTEXT_MAX_CHARS),
      },
      select: { id: true },
    });
    return row.id;
  } catch (err) {
    console.error("Failed to save case analysis:", err);
    return null;
  }
}

/** Appends a chat turn or a generated document (and documents added in chat) to a saved analysis. */
export async function appendToAnalysis(
  id: string,
  update: {
    messages?: StoredMessage[];
    document?: StoredDocument;
    addedText?: string;
  }
): Promise<void> {
  try {
    const row = await prisma.caseAnalysis.findUnique({
      where: { id },
      select: { messages: true, documents: true, caseContext: true },
    });
    if (!row) return;
    const messages = (row.messages as unknown as StoredMessage[]) ?? [];
    const documents = (row.documents as unknown as StoredDocument[]) ?? [];
    await prisma.caseAnalysis.update({
      where: { id },
      data: {
        messages: [...messages, ...(update.messages ?? [])] as object[],
        documents: update.document ? ([...documents, update.document] as object[]) : undefined,
        caseContext: update.addedText
          ? (row.caseContext + update.addedText).slice(0, CASE_CONTEXT_MAX_CHARS)
          : undefined,
      },
    });
  } catch (err) {
    console.error(`Failed to update case analysis ${id}:`, err);
  }
}
