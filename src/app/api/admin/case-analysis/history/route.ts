import { prisma } from "@/lib/prisma";
import { withAdminResult } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function GET() {
  return withAdminResult(async () => {
    const rows = await prisma.caseAnalysis.findMany({
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: {
        id: true,
        title: true,
        models: true,
        messages: true,
        documents: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const items = rows.map(({ messages, documents, ...r }) => ({
      ...r,
      messageCount: Array.isArray(messages) ? messages.length : 0,
      documentCount: Array.isArray(documents) ? documents.length : 0,
    }));
    return { items };
  });
}
