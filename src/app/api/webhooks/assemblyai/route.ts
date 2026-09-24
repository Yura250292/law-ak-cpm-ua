import { NextRequest, NextResponse, after } from "next/server";
import { WEBHOOK_AUTH_HEADER } from "@/lib/conversations/assemblyai";
import { onTranscriptWebhook } from "@/lib/conversations/process";
import { secretMatches } from "@/lib/conversations/secret";

// Самарі Claude складається в after() і може тривати хвилину-дві.
export const maxDuration = 300;

/**
 * AssemblyAI повідомляє, що розпізнавання завершилось: { transcript_id, status }.
 * Сам текст забираємо окремим запитом — у вебхуку його немає.
 */
export async function POST(request: NextRequest) {
  if (
    !secretMatches(request.headers.get(WEBHOOK_AUTH_HEADER), process.env.ASSEMBLYAI_WEBHOOK_SECRET)
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { transcript_id?: string } | null;
  const transcriptId = body?.transcript_id;
  if (!transcriptId) return NextResponse.json({ ok: false }, { status: 400 });

  after(() => onTranscriptWebhook(transcriptId));
  return NextResponse.json({ ok: true });
}
