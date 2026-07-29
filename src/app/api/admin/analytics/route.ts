import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminResult } from "@/lib/admin-api";
import { dayKey, labelPath, labelReferrer, lastNDays } from "@/lib/analytics";

export const dynamic = "force-dynamic";

const ALLOWED_RANGES = [7, 14, 30, 90] as const;

interface ViewRow {
  path: string;
  referrer: string | null;
  visitorId: string;
  sessionId: string;
  country: string | null;
  device: string;
  browser: string | null;
  isNewVisit: boolean;
  duration: number | null;
  createdAt: Date;
}

/** Рахує топ-N за ключем, решту не показуємо. */
function topBy<T>(
  rows: T[],
  key: (row: T) => string | null,
  limit: number
): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const k = key(row);
    if (k === null) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function GET(request: NextRequest) {
  return withAdminResult(async () => {
    const rangeParam = Number(request.nextUrl.searchParams.get("range") ?? 30);
    const range = (ALLOWED_RANGES as readonly number[]).includes(rangeParam)
      ? rangeParam
      : 30;

    const days = lastNDays(range);
    const since = new Date(`${days[0]}T00:00:00.000Z`);

    // Попередній період такої ж довжини — для порівняння динаміки.
    const prevSince = new Date(since);
    prevSince.setUTCDate(prevSince.getUTCDate() - range);

    const [rows, prevRows] = await Promise.all([
      prisma.pageView.findMany({
        where: { createdAt: { gte: since } },
        select: {
          path: true,
          referrer: true,
          visitorId: true,
          sessionId: true,
          country: true,
          device: true,
          browser: true,
          isNewVisit: true,
          duration: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }) as Promise<ViewRow[]>,
      prisma.pageView.findMany({
        where: { createdAt: { gte: prevSince, lt: since } },
        select: { visitorId: true, sessionId: true },
      }),
    ]);

    // --- Денний ряд ---
    const byDay = new Map<
      string,
      { views: number; visitors: Set<string>; sessions: Set<string> }
    >();
    for (const day of days) {
      byDay.set(day, { views: 0, visitors: new Set(), sessions: new Set() });
    }
    for (const row of rows) {
      const bucket = byDay.get(dayKey(row.createdAt));
      if (!bucket) continue;
      bucket.views += 1;
      bucket.visitors.add(row.visitorId);
      bucket.sessions.add(row.sessionId);
    }

    const daily = days.map((day) => {
      const b = byDay.get(day)!;
      return {
        date: day,
        views: b.views,
        visitors: b.visitors.size,
        sessions: b.sessions.size,
      };
    });

    // --- Підсумки ---
    const visitors = new Set(rows.map((r) => r.visitorId));
    const sessions = new Map<string, ViewRow[]>();
    for (const row of rows) {
      const list = sessions.get(row.sessionId);
      if (list) list.push(row);
      else sessions.set(row.sessionId, [row]);
    }

    // Відмови — сесії рівно з одним переглядом.
    const bounced = [...sessions.values()].filter((v) => v.length === 1).length;
    const bounceRate = sessions.size
      ? Math.round((bounced / sessions.size) * 100)
      : 0;

    const durations = rows
      .map((r) => r.duration)
      .filter((d): d is number => typeof d === "number" && d > 0);
    const avgDuration = durations.length
      ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
      : 0;

    const prevVisitors = new Set(prevRows.map((r) => r.visitorId)).size;
    const prevViews = prevRows.length;

    const today = dayKey(new Date());
    const todayBucket = byDay.get(today);

    const summary = {
      views: rows.length,
      visitors: visitors.size,
      sessions: sessions.size,
      viewsToday: todayBucket?.views ?? 0,
      visitorsToday: todayBucket?.visitors.size ?? 0,
      avgPerDay: Math.round((rows.length / range) * 10) / 10,
      viewsPerSession: sessions.size
        ? Math.round((rows.length / sessions.size) * 10) / 10
        : 0,
      bounceRate,
      avgDuration,
      // Приріст у % до попереднього періоду; null — якщо порівнювати нема з чим.
      viewsChange: prevViews
        ? Math.round(((rows.length - prevViews) / prevViews) * 100)
        : null,
      visitorsChange: prevVisitors
        ? Math.round(((visitors.size - prevVisitors) / prevVisitors) * 100)
        : null,
    };

    // --- Розрізи ---
    const pages = topBy(rows, (r) => r.path, 15).map((p) => ({
      ...p,
      label: labelPath(p.name),
    }));

    // Джерела: прямі переходи — це сесії, що почалися без referrer.
    const entries = [...sessions.values()].map((v) => v[0]!);
    const sourceCounts = new Map<string, number>();
    for (const entry of entries) {
      const label = labelReferrer(entry.referrer);
      sourceCounts.set(label, (sourceCounts.get(label) ?? 0) + 1);
    }
    const sources = [...sourceCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const devices = topBy(rows, (r) => r.device, 5);
    const browsers = topBy(rows, (r) => r.browser, 6);
    const countries = topBy(rows, (r) => r.country ?? null, 8);

    // --- Активність за годинами доби (0–23) ---
    const hours = Array.from({ length: 24 }, (_, h) => ({ hour: h, views: 0 }));
    for (const row of rows) {
      hours[row.createdAt.getUTCHours()]!.views += 1;
    }

    return {
      range,
      summary,
      daily,
      pages,
      sources,
      devices,
      browsers,
      countries,
      hours,
    };
  });
}
