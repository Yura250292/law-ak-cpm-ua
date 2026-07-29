/**
 * Синхронізує напрямки практики (таблиця PracticeArea) з джерела
 * src/lib/practice-areas.ts у базу даних.
 *
 * Безпечність:
 *   • працює ТІЛЬКИ з таблицею PracticeArea — інші таблиці не чіпає;
 *   • нічого не видаляє (жодного deleteMany) — лише upsert за slug;
 *   • напрямки, яких немає у джерелі, лишаються в базі недоторканими;
 *   • за замовчуванням — режим перегляду (dry-run), який нічого не пише.
 *
 * Запуск:
 *   # 1) подивитись поточний стан бази, нічого не змінюючи
 *   DATABASE_URL="<прод-URL>" npx tsx prisma/sync-practice-areas.ts
 *
 *   # 2) застосувати зміни
 *   DATABASE_URL="<прод-URL>" npx tsx prisma/sync-practice-areas.ts --apply
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { practiceAreas } from "../src/lib/practice-areas";

const APPLY = process.argv.includes("--apply");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Помилка: DATABASE_URL не задано.");
  process.exit(1);
}

/** Ховає пароль у рядку підключення, щоб не світити його в логах. */
function maskUrl(url: string): string {
  return url.replace(/(:\/\/[^:@/]+:)[^@]*@/, "$1***@");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`База : ${maskUrl(connectionString!)}`);
  console.log(`Режим: ${APPLY ? "ЗАПИС (--apply)" : "ПЕРЕГЛЯД (нічого не змінюється)"}\n`);

  // Поточний стан — усі статуси, не лише PUBLISHED.
  const existing = await prisma.practiceArea.findMany({
    orderBy: { sortOrder: "asc" },
    select: { slug: true, title: true, status: true, sortOrder: true },
  });

  console.log(`Зараз у базі: ${existing.length} напрямків`);
  for (const e of existing) {
    console.log(`  • ${e.slug.padEnd(22)} ${e.status.padEnd(10)} sortOrder=${e.sortOrder}  ${e.title}`);
  }

  const bySlug = new Map(existing.map((e) => [e.slug, e]));

  console.log(`\nУ джерелі (practice-areas.ts): ${practiceAreas.length} напрямків`);
  for (const [i, pa] of practiceAreas.entries()) {
    const cur = bySlug.get(pa.slug);
    const action = !cur
      ? "СТВОРИТИ"
      : cur.status !== "PUBLISHED"
        ? `ОНОВИТИ + опублікувати (було ${cur.status})`
        : "ОНОВИТИ";
    console.log(`  • ${pa.slug.padEnd(22)} → ${action}  (sortOrder=${i})`);
  }

  // Напрямки в базі, яких немає у джерелі — не чіпаємо, лише попереджаємо.
  const sourceSlugs = new Set(practiceAreas.map((p) => p.slug));
  const orphans = existing.filter((e) => !sourceSlugs.has(e.slug));
  if (orphans.length) {
    console.log(
      `\nУ базі є ${orphans.length} напрямків поза джерелом — вони НЕ будуть змінені:`,
    );
    for (const o of orphans) console.log(`  • ${o.slug} (${o.title})`);
  }

  if (!APPLY) {
    console.log("\nЦе був перегляд. Щоб застосувати, додайте --apply");
    return;
  }

  console.log("\nЗастосовую…");
  for (const [i, pa] of practiceAreas.entries()) {
    const payload = {
      title: pa.title,
      shortDescription: pa.shortDescription,
      icon: pa.icon,
      description: pa.description,
      services: pa.services,
      advantages: pa.advantages,
      process: pa.process as unknown as object,
      sortOrder: i,
    };

    const res = await prisma.practiceArea.upsert({
      where: { slug: pa.slug },
      update: { ...payload, status: "PUBLISHED" as const },
      create: { slug: pa.slug, ...payload, status: "PUBLISHED" as const },
    });
    console.log(`  ✓ ${res.slug.padEnd(22)} ${res.status} sortOrder=${res.sortOrder}`);
  }

  const after = await prisma.practiceArea.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, sortOrder: true },
  });
  console.log(`\nГотово. Опубліковано напрямків: ${after.length}`);
  for (const a of after) console.log(`  • ${a.slug} (sortOrder=${a.sortOrder})`);
}

main()
  .catch((e) => {
    console.error("\nПомилка:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
