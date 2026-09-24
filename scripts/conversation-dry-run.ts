/**
 * Прогнати локальний аудіофайл через розпізнавання й самарі — без R2, бази й
 * Telegram. Для налаштування промпту на справжніх записах.
 *
 *   npx tsx scripts/conversation-dry-run.ts ./запис.m4a
 *
 * Потрібні ASSEMBLYAI_API_KEY і ANTHROPIC_API_KEY у .env. Файл іде в AssemblyAI
 * через їхній /v2/upload, транскрипт після прогону видаляється.
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import {
  deleteTranscript,
  getTranscript,
  renderTranscript,
  submitTranscript,
} from "../src/lib/conversations/assemblyai";
import { summarizeTranscript } from "../src/lib/conversations/summarize";

async function main() {
  const path = process.argv[2];
  if (!path) throw new Error("Вкажіть шлях до аудіофайлу");
  const key = process.env.ASSEMBLYAI_API_KEY;
  if (!key) throw new Error("ASSEMBLYAI_API_KEY не задано");

  const body = await readFile(path);
  console.log(`Завантажую ${basename(path)} (${(body.length / 1024 / 1024).toFixed(1)} МБ)…`);
  const up = await fetch("https://api.assemblyai.com/v2/upload", {
    method: "POST",
    headers: { authorization: key, "content-type": "application/octet-stream" },
    body,
  });
  const { upload_url } = (await up.json()) as { upload_url: string };

  const { id } = await submitTranscript({ audioUrl: upload_url, webhookUrl: null, wordBoost: ["адвокат", "Кабаль"] });
  console.log(`Розпізнавання ${id}…`);
  let t = await getTranscript(id);
  while (t.status === "queued" || t.status === "processing") {
    await new Promise((r) => setTimeout(r, 5000));
    t = await getTranscript(id);
    process.stdout.write(".");
  }
  console.log();
  if (t.status === "error") throw new Error(`AssemblyAI: ${t.error}`);

  const transcript = renderTranscript(t.utterances);
  await deleteTranscript(id);
  console.log("\n══════ ТРАНСКРИПТ ══════\n");
  console.log(transcript);

  console.log("\n══════ САМАРІ ══════\n");
  const started = Date.now();
  const s = await summarizeTranscript({
    transcript,
    recordedAt: new Date(),
    knownClientName: null,
    knownClientPhone: null,
    fileName: basename(path),
  });
  console.log(JSON.stringify(s.structured, null, 2));
  console.log(
    `\n${s.model} · ${s.inputTokens} вх. / ${s.outputTokens} вих. токенів · ${((Date.now() - started) / 1000).toFixed(0)} с`
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
