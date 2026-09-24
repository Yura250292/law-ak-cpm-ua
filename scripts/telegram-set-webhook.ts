/**
 * Прив'язати бота розмов до сайту.
 *
 *   npx tsx scripts/telegram-set-webhook.ts https://<домен>
 *
 * Потрібні TELEGRAM_BOT_TOKEN і TELEGRAM_WEBHOOK_SECRET у .env (ті самі, що у Vercel).
 */
import "dotenv/config";

async function main() {
  const base = (process.argv[2] ?? process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!base.startsWith("https://")) throw new Error("Потрібна https-адреса сайту першим аргументом");
  if (!token || !secret) throw new Error("Задайте TELEGRAM_BOT_TOKEN і TELEGRAM_WEBHOOK_SECRET");

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url: `${base}/api/telegram/webhook`,
      secret_token: secret,
      allowed_updates: ["message"],
      drop_pending_updates: true,
    }),
  });
  console.log(await res.json());

  const info = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  console.log(await info.json());
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
