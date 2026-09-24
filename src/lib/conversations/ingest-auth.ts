import { NextRequest, NextResponse } from "next/server";
import { secretMatches } from "./secret";

/**
 * Вхід для застосунку на Mac: окремий токен INGEST_TOKEN замість пароля
 * адмінки — він уміє лише додавати записи й більше нічого.
 */
export function ingestUnauthorized(request: NextRequest): NextResponse | null {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (secretMatches(token, process.env.INGEST_TOKEN)) return null;
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
