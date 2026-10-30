import { prisma } from "@/lib/prisma";

export interface TrustedSourceInfo {
  name: string;
  domain: string;
}

/** "https://www.Zakon.rada.gov.ua/laws/..." → "zakon.rada.gov.ua"; null if not a URL/host. */
export function normalizeDomain(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  try {
    const url = new URL(/^[a-z]+:\/\//i.test(raw) ? raw : `https://${raw}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return host.includes(".") ? host : null;
  } catch {
    return null;
  }
}

/** The official source a URL belongs to (same host or its subdomain), if any. */
export function matchOfficial(
  url: string,
  sources: TrustedSourceInfo[]
): TrustedSourceInfo | null {
  const host = normalizeDomain(url);
  if (!host) return null;
  return sources.find((s) => host === s.domain || host.endsWith(`.${s.domain}`)) ?? null;
}

/** Sources for the chat prompt. Empty list if the DB is unavailable — search still works. */
export async function listTrustedSources(): Promise<TrustedSourceInfo[]> {
  try {
    return await prisma.trustedSource.findMany({
      orderBy: { createdAt: "asc" },
      select: { name: true, domain: true },
    });
  } catch (err) {
    console.error("Failed to load trusted sources:", err);
    return [];
  }
}
