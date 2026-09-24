import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminResult } from "@/lib/admin-api";
import type { Prisma } from "@/generated/prisma/client";
import { CONVERSATION_STATUSES, type ConversationStatus } from "@/lib/conversations/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  return withAdminResult(async () => {
    const sp = request.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page")) || 1);
    const q = sp.get("q")?.trim();
    const status = sp.get("status");

    const where: Prisma.ConversationWhereInput = {};
    if (status && (CONVERSATION_STATUSES as readonly string[]).includes(status)) {
      where.status = status as ConversationStatus;
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { clientName: { contains: q, mode: "insensitive" } },
        { clientPhone: { contains: q } },
        { summary: { contains: q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: { recordedAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          title: true,
          clientName: true,
          clientPhone: true,
          recordedAt: true,
          audioDurationMs: true,
          status: true,
          source: true,
          fileName: true,
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    return { items, total, page, pageSize: PAGE_SIZE };
  });
}
