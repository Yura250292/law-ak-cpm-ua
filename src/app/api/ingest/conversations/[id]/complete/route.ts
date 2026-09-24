import { NextRequest, NextResponse, after } from "next/server";
import { attachUploadedAudio, submitForTranscription } from "@/lib/conversations/process";
import { ingestUnauthorized } from "@/lib/conversations/ingest-auth";

export const maxDuration = 60;

interface Params {
  params: Promise<{ id: string }>;
}

/** Крок 2 завантаження з Mac: файл уже в R2 — замовити розпізнавання. */
export async function POST(request: NextRequest, { params }: Params) {
  const denied = ingestUnauthorized(request);
  if (denied) return denied;

  const { id } = await params;
  const { key, contentType } = ((await request.json().catch(() => null)) ?? {}) as {
    key?: string;
    contentType?: string;
  };
  const r = await attachUploadedAudio(id, key ?? "", contentType ?? "");
  // "busy" — файл уже прив'язали попереднім викликом: для Mac це теж успіх.
  if (r === "bad-key" || r === "missing") {
    return NextResponse.json({ error: r }, { status: 400 });
  }
  if (r === "ok") after(() => submitForTranscription(id));
  return NextResponse.json({ ok: true });
}
