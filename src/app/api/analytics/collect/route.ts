import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  detectBrowser,
  detectDevice,
  getClientIp,
  getCountry,
  makeVisitorId,
  normalizePath,
  normalizeReferrer,
} from "@/lib/analytics";

// Публічний ендпоінт збору переглядів. Викликається beacon-ом з клієнта.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  path: z.string().max(500),
  referrer: z.string().max(500).nullish(),
  sessionId: z.string().min(8).max(64),
  isNewVisit: z.boolean().default(true),
  // Для події виходу зі сторінки: оновлює тривалість замість нового запису.
  viewId: z.string().max(40).nullish(),
  duration: z.number().int().min(0).max(60 * 60 * 6).nullish(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = payloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "bad payload" }, { status: 400 });
    }
    const data = parsed.data;

    // Оновлення тривалості вже існуючого перегляду.
    if (data.viewId && typeof data.duration === "number") {
      await prisma.pageView
        .update({
          where: { id: data.viewId },
          data: { duration: data.duration },
        })
        .catch(() => null); // запис міг бути видалений — ігноруємо
      return NextResponse.json({ ok: true });
    }

    const userAgent = request.headers.get("user-agent") ?? "";
    const device = detectDevice(userAgent);

    // Ботів не пишемо взагалі — вони засмічують статистику.
    if (device === "bot") {
      return NextResponse.json({ ok: true, skipped: "bot" });
    }

    const ip = getClientIp(request.headers);
    const ownHost = request.headers.get("host");

    const view = await prisma.pageView.create({
      data: {
        path: normalizePath(data.path),
        referrer: normalizeReferrer(data.referrer, ownHost),
        visitorId: makeVisitorId(ip, userAgent),
        sessionId: data.sessionId,
        country: getCountry(request.headers),
        device,
        browser: detectBrowser(userAgent),
        isNewVisit: data.isNewVisit,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, viewId: view.id });
  } catch (error) {
    // Аналітика ніколи не повинна ламати сайт — логуємо і мовчимо.
    console.error("Analytics collect error:", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
