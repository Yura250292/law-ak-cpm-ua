/**
 * Самарі розмови адвоката з клієнтом — Claude зі строгою JSON-схемою.
 *
 * Структура промпту (вхідні дані, як читати зіпсований STT, заборона порожніх
 * формулювань, самоперевірка) — з Budvik src/lib/meetings/summarize.ts, зміст —
 * під адвокатську практику.
 */

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { ProviderError } from "./errors";
import { ConversationSummarySchema, type ConversationSummary } from "./types";

export const SUMMARY_MODEL = "claude-opus-5";
const LAWYER_NAME = "Кабаль Анастасія";

/** Транскрипт довший за це — обрізаємо хвіст, щоб не впертися в ліміти запиту. */
const MAX_TRANSCRIPT_CHARS = 400_000;

export function summaryConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

const SYSTEM_PROMPT = `Ти — помічник адвоката ${LAWYER_NAME}. Ти читаєш транскрипт телефонної розмови або особистої консультації адвоката з клієнтом (чи потенційним клієнтом) і повертаєш структурований розбір у JSON строго за схемою.

Твій розбір читає сам адвокат — через день, тиждень чи місяць, коли готує документи, дзвонить клієнту або йде в суд. Він має відновити зміст розмови БЕЗ транскрипту. Тому пиши конкретно: дати, суми, імена, назви установ, номери справ, строки, умови — а не «обговорили ситуацію».

═══ ВХІДНІ ДАНІ ═══
1. ДАТА РОЗМОВИ — від неї рахуй усі відносні строки («до п'ятниці», «через два тижні»).
2. ВІДОМЕ ПРО КЛІЄНТА (якщо є) — ім'я чи телефон, які вже відомі з інших джерел.
3. НАЗВА ФАЙЛУ ЗАПИСУ (якщо є) — телефон часто пише туди ім'я контакту чи номер і дату дзвінка; це підказка, а не факт.
4. ТРАНСКРИПТ із лейблами Speaker A/B/C і [mm:ss].

═══ ЯК ЧИТАТИ ТРАНСКРИПТ ═══
Розпізнавання мовлення псує українську: спотворює прізвища, назви вулиць, судів і установ, юридичні терміни, зліплює слова, іноді вставляє беззмістовні фрази. Відновлюй зміст за контекстом, але нерозбірливе не переказуй і не вигадуй — пропусти. Якщо цифра чи дата прозвучала нечітко, пиши її так, як почулась, і познач «(нечітко)». Змішана українсько-російська мова — норма.

═══ СПІКЕРИ ═══
Для КОЖНОГО лейбла визнач роль (label — лише літера лейбла: «A», а не «Speaker A»): LAWYER — адвокат (консультує, пояснює закон, називає ціну послуг, «я підготую позов»); CLIENT — людина, яка звернулась по допомогу; OTHER — хтось третій (родич клієнта, секретар). name — ім'я, якщо прозвучало, інакше null.
Адвоката завжди називай точно: ${LAWYER_NAME}, навіть якщо розпізнавання спотворило прізвище.

═══ ПОЛЯ ═══
suggestedTitle — 4–8 слів про суть: «Розлучення і поділ квартири на Сихові», «Спадщина після батька, пропущений строк». Без слів «Розмова», «Дзвінок» і без дати.
clientName — як назвався клієнт (ПІБ чи ім'я), інакше null.
clientPhone — телефон, якщо прозвучав у розмові, інакше null.
matterType — категорія справи одним-двома словами: сімейна, спадкова, житлова, земельна, трудова, кримінальна, адміністративна, військова, договірна, борги/стягнення, ДТП/страхування, інше.
summary — 6–12 речень суцільним текстом: хто клієнт і в чому його проблема, ключові обставини, що порадив адвокат, про що домовились і що далі. З датами й сумами.
clientRequest — одним-двома реченнями: чого клієнт хоче досягти.
facts — ключові обставини справи окремими пунктами: дати подій, суми, майно, учасники й інші сторони, установи, номери справ і документів, що вже зроблено. Кожен пункт — з конкретикою.
lawyerAdvice — що адвокат пояснив чи порадив: правова позиція, варіанти дій, шанси, ризики, на які закони чи практику посилався. Кожен пункт — повне речення.
agreements — про що домовились: гонорар і порядок оплати, обсяг робіт, наступна зустріч чи дзвінок, хто що готує. Лише справжні домовленості, не наміри.
nextSteps — конкретні дії після розмови. action — з дієслова («Підготувати позовну заяву про розірвання шлюбу», «Надіслати копію свідоцтва про право власності»); who — LAWYER, CLIENT або OTHER; due — YYYY-MM-DD від дати розмови, якщо строк прозвучав, інакше null. Кожне «я підготую / надішліть мені / треба подати / зателефоную» — окремий крок.
documentsRequested — документи, які клієнт має надати чи які треба отримати (витяги, довідки, свідоцтва, договори, рішення суду).
deadlines — процесуальні й інші строки, що прозвучали або очевидно випливають зі сказаного (позовна давність, строк прийняття спадщини, строк оскарження), з датою, якщо її можна визначити. Не вигадуй строків, яких не випливає з розмови.
risks — що може зашкодити справі: пропущені строки, брак доказів, позиція іншої сторони, суперечності в словах клієнта.
openQuestions — що лишилось нез'ясованим і що треба уточнити в клієнта.

ЗАБОРОНЕНІ порожні формулювання: «обговорили ситуацію», «надано консультацію», «розглянули питання», «клієнт звернувся з питанням». У кожному пункті має бути щонайменше одне з: дата, сума, ім'я, назва установи чи документа, конкретна дія з наслідком. Нема про що сказати конкретно — краще менше пунктів або порожній масив.

═══ МОВА ═══
Усі поля — українською, юридично грамотно, але зрозуміло. Імена й назви — як у транскрипті.

═══ САМОПЕРЕВІРКА ═══
1. Чи зрозуміє адвокат суть справи й наступні кроки, не відкриваючи транскрипт?
2. Кожне доручення, обіцянка чи «треба» стало пунктом nextSteps?
3. Жодної вигаданої дати, суми, строку, імені чи статті закону?
4. Чи немає порожніх формулювань?
Якщо десь «ні» — виправ.`;

function kyivDate(at: Date): string {
  const fmt = new Intl.DateTimeFormat("uk-UA", {
    timeZone: "Europe/Kyiv",
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return fmt.format(at);
}

export type SummaryResult = {
  structured: ConversationSummary;
  summaryText: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

export async function summarizeTranscript(input: {
  transcript: string;
  recordedAt: Date;
  knownClientName: string | null;
  knownClientPhone: string | null;
  fileName: string | null;
}): Promise<SummaryResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ProviderError("ANTHROPIC_API_KEY не задано", "fatal");
  }
  const client = new Anthropic();

  const transcript =
    input.transcript.length > MAX_TRANSCRIPT_CHARS
      ? `${input.transcript.slice(0, MAX_TRANSCRIPT_CHARS)}\n\n[… транскрипт обрізано …]`
      : input.transcript;

  const known = [
    input.knownClientName ? `Ім'я: ${input.knownClientName}` : null,
    input.knownClientPhone ? `Телефон: ${input.knownClientPhone}` : null,
  ].filter(Boolean);

  const userPrompt = [
    `ДАТА РОЗМОВИ: ${kyivDate(input.recordedAt)}`,
    `ВІДОМЕ ПРО КЛІЄНТА: ${known.length ? known.join("; ") : "нічого"}`,
    `НАЗВА ФАЙЛУ ЗАПИСУ: ${input.fileName ?? "немає"}`,
    `ТРАНСКРИПТ:\n${transcript}`,
    "ЗАВДАННЯ: розбери розмову за схемою.",
  ].join("\n\n");

  let response;
  try {
    response = await client.beta.messages.parse({
      model: SUMMARY_MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      // Якщо класифікатор безпеки відхилить запит (у розмовах про кримінальні
      // справи це можливо), API сам перезапустить його на рекомендованій моделі.
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: {
        effort: "medium",
        format: betaZodOutputFormat(ConversationSummarySchema),
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError || e instanceof Anthropic.InternalServerError) {
      throw new ProviderError(`Claude: ${e.message}`, "transient", e.status);
    }
    if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) {
      throw new ProviderError(`Claude: ${e.message}`, "fatal", e.status);
    }
    if (e instanceof Anthropic.APIError) {
      throw new ProviderError(`Claude: ${e.message}`, "retry", e.status);
    }
    if (e instanceof Anthropic.APIConnectionError) {
      throw new ProviderError(`Claude: немає зв'язку (${e.message})`, "transient");
    }
    throw e;
  }

  if (response.stop_reason === "refusal") {
    throw new ProviderError("Claude відмовився розбирати цю розмову", "fatal");
  }
  if (response.stop_reason === "max_tokens") {
    throw new ProviderError("Claude: відповідь обірвалась на ліміті токенів", "retry");
  }
  const structured = response.parsed_output;
  if (!structured) {
    throw new ProviderError("Claude: відповідь не відповідає схемі", "retry");
  }
  // Репліки в транскрипті мають лейбл «A»; модель інколи повертає «Speaker A».
  for (const sp of structured.speakers) {
    sp.label = sp.label.replace(/^speaker\s*/i, "").trim();
  }

  return {
    structured,
    summaryText: structured.summary,
    model: response.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}
