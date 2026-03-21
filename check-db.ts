import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const templates = await prisma.documentTemplate.findMany({ select: { id: true, slug: true, title: true } });
  console.log("Templates:", JSON.stringify(templates, null, 2));

  const requests = await prisma.documentRequest.findMany({
    select: { id: true, status: true, pdfUrl: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  console.log("Recent requests:", JSON.stringify(requests, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
