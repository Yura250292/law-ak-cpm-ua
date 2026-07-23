import { NextResponse } from "next/server";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";

/**
 * Обгортка для admin API-роутів: перевіряє авторизацію, обробляє
 * AdminAuthError → 401 та інші помилки → 500.
 */
export async function withAdmin<T>(
  handler: () => Promise<T>
): Promise<NextResponse> {
  try {
    await requireAdmin();
    const result = await handler();
    return NextResponse.json(result ?? { ok: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Admin API error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Як withAdmin, але поважає ApiError.status для клієнтських помилок. */
export async function withAdminResult<T>(
  handler: () => Promise<T>
): Promise<NextResponse> {
  try {
    await requireAdmin();
    const result = await handler();
    return NextResponse.json(result ?? { ok: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Admin API error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
