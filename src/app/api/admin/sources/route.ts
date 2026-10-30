import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminResult, ApiError } from "@/lib/admin-api";
import { normalizeDomain } from "@/lib/trusted-sources";

export const dynamic = "force-dynamic";

export async function GET() {
  return withAdminResult(async () => {
    const items = await prisma.trustedSource.findMany({ orderBy: { createdAt: "asc" } });
    return { items };
  });
}

export async function POST(request: NextRequest) {
  return withAdminResult(async () => {
    const body = (await request.json()) as { name?: unknown; url?: unknown };
    const url = typeof body.url === "string" ? body.url.trim().slice(0, 500) : "";
    const domain = normalizeDomain(url);
    if (!domain) throw new ApiError(400, "Вкажіть коректне посилання, напр. https://zakon.rada.gov.ua");
    const name =
      (typeof body.name === "string" ? body.name.trim().slice(0, 200) : "") || domain;

    const existing = await prisma.trustedSource.findUnique({ where: { domain } });
    if (existing) throw new ApiError(409, `Сайт ${domain} уже є в списку`);

    const item = await prisma.trustedSource.create({
      data: { name, url: /^[a-z]+:\/\//i.test(url) ? url : `https://${url}`, domain },
    });
    return { item };
  });
}
