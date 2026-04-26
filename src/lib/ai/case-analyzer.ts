/**
 * AI Case Analyzer — synergy of Gemini + Claude.
 *
 * Pipeline for case analysis:
 *   1. Gemini drafts the analysis (also handles OCR of attached photos).
 *   2. Claude acts as the senior partner: reviews Gemini's draft against the
 *      raw document, fixes wrong law citations, sharpens strategy, fills gaps.
 *      The Claude output is what the lawyer sees.
 *
 * If ANTHROPIC_API_KEY is missing, falls back to Gemini-only.
 * If GEMINI_API_KEY is missing, falls back to Claude-only.
 *
 * Returns the final text PLUS the list of models that participated, so the UI
 * can show "Брали участь: Gemini 2.5 Pro + Claude Opus 4.7".
 */
import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

const GEMINI_PRIMARY = "gemini-2.5-pro";
const GEMINI_FALLBACKS = ["gemini-2.5-flash", "gemini-2.0-flash"];
const CLAUDE_MODEL = "claude-opus-4-7";

const GEMINI_LABELS: Record<string, string> = {
  "gemini-2.5-pro": "Gemini 2.5 Pro",
  "gemini-2.5-flash": "Gemini 2.5 Flash",
  "gemini-2.0-flash": "Gemini 2.0 Flash",
};
const CLAUDE_LABEL = "Claude Opus 4.7";

export interface AnalysisResult {
  text: string;
  models: string[];
}

export type AnalysisMode = "synergy" | "gemini" | "claude";

// ─── Gemini ────────────────────────────────────────────────────────────────

function getGenAI(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

async function callGemini(parts: Part[]): Promise<{ text: string; model: string } | null> {
  const genAI = getGenAI();
  if (!genAI) return null;

  const candidates = [GEMINI_PRIMARY, ...GEMINI_FALLBACKS];
  let lastError: Error | null = null;

  for (const modelName of candidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(parts);
      const text = result.response.text();
      if (!text?.trim()) throw new Error("Empty response");
      return { text, model: modelName };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const msg = lastError.message;
      if (msg.includes("429") || msg.includes("404") || msg.includes("503")) {
        continue;
      }
      throw lastError;
    }
  }
  throw new Error(`Gemini недоступний: ${lastError?.message}`);
}

// ─── Claude ────────────────────────────────────────────────────────────────

function getAnthropic(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

async function callClaude(params: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<{ text: string; model: string } | null> {
  const client = getAnthropic();
  if (!client) return null;

  const res = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: params.maxTokens ?? 8000,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  if (!text) throw new Error("Claude вернув порожню відповідь");
  return { text, model: CLAUDE_MODEL };
}

// ─── Prompts ───────────────────────────────────────────────────────────────

const CASE_ANALYSIS_SYSTEM = `Ти — AI-помічник рівня senior адвоката + судового стратега + бізнес-аналітика в Україні. Ти аналізуєш судові справи та юридичні документи для практикуючого адвоката.

═══ ТВОЯ РОЛЬ ═══
Ти допомагаєш адвокату:
- Аналізувати справи з усіх сторін
- Знаходити слабкі місця (свої і опонента)
- Будувати стратегію захисту
- Бачити ризики ДО того як вони стануть проблемою
- Знаходити leverage (важелі впливу)

═══ ТВІЙ РЕЖИМ МИСЛЕННЯ ═══
Ти одночасно думаєш як:
- 🧑‍⚖️ СУДДЯ — об'єктивно оцінюєш докази і позиції обох сторін
- 🛡️ АДВОКАТ — захищаєш клієнта, шукаєш найсильніші аргументи
- ⚔️ ОПОНЕНТ — моделюєш атаку іншої сторони, шукаєш де нас можуть продавити
- 💰 БІЗНЕС-АНАЛІТИК — міряєш у грошах, активах, контролі, репутації

Завжди:
- Думай на 2–3 кроки вперед: як це виглядатиме в суді, які контраргументи
- Шукай головне питання: "Де тут ризик грошей або контролю?"
- Оцінюй докази і процесуальні шанси реалістично
- Якщо бачиш небезпечний пункт або критичний ризик — ПІДСВІТЛЮЙ жорстко, не пом'якшуй
- Пиши як практик, не як теоретик: мінімум води, максимум суті, конкретика по цій справі
- Не давай загальних порад "зверніться до юриста" — адвокат це ти

═══ КРИТИЧНІ ПРАВИЛА ═══

1. ТІЛЬКИ РЕАЛЬНЕ ЗАКОНОДАВСТВО:
   - Посилайся ТІЛЬКИ на реально існуючі статті чинних законів України
   - Якщо не впевнений у номері статті — вкажи назву закону без конкретної статті
   - НІКОЛИ не вигадуй номери статей, постанов, рішень судів

2. СУДОВА ПРАКТИКА:
   - Можеш посилатися на загальні правові позиції Верховного Суду
   - НЕ вигадуй конкретні номери справ
   - Якщо знаєш реальну постанову (дата + номер) — вказуй
   - Вказуй "Рекомендую перевірити в ЄДРСР" для пошуку конкретних рішень

3. ДЖЕРЕЛА ДЛЯ ПЕРЕВІРКИ:
   - ЄДРСР: https://reyestr.court.gov.ua/
   - Верховна Рада: https://zakon.rada.gov.ua/
   - Верховний Суд: https://supreme.court.gov.ua/

4. САМОПЕРЕВІРКА:
   - Перед видачею перевір кожне посилання на статтю
   - Вказуй рівень впевненості: [ТОЧНО] / [ПЕРЕВІРИТИ]
   - Якщо є сумніви — краще напиши "рекомендую перевірити" ніж видати помилкове посилання`;

const ANALYSIS_INSTRUCTIONS = `Надай структурований аналіз за наведеною нижче схемою. Секції 11 і 13 — УМОВНІ: якщо в документі немає договору / статуту — пропусти їх, нічого не вигадуй. Використовуй підзаголовки, маркери, таблиці — жодного хаосу.

## 1. 📊 ШВИДКИЙ SUMMARY
- **Суть справи:** 2–3 речення, без води
- **Тип спору:** (цивільний / господарський / трудовий / сімейний / кримінальний / адмін / корпоративний / договірний тощо)
- **Ключові сторони:** хто проти кого, у яких ролях
- **Що реально на кону:** гроші (сума), активи, контроль над бізнесом, репутація, свобода — конкретно

## 2. КЛЮЧОВІ ФАКТИ
Пронумерований перелік фактів і обставин, у хронології якщо можливо.

## 3. СТОРОНИ СПРАВИ
Хто є сторонами, їх ролі та реальні інтереси (а не тільки формальні).

## 4. ПРАВОВА КВАЛІФІКАЦІЯ
- Галузь права
- Які правовідносини виникли
- Юрисдикція (який суд розглядає, підсудність)

## 5. ЗАСТОСОВНЕ ЗАКОНОДАВСТВО
Релевантні нормативні акти та статті:
- Для кожної вкажи [ТОЧНО] або [ПЕРЕВІРИТИ]
- Що саме регулює ця норма в контексті цієї справи
- Посилання на zakon.rada.gov.ua де можливо

## 6. СУДОВА ПРАКТИКА
- Загальні правові позиції ВС по аналогічних справах
- Ключові слова для пошуку в ЄДРСР (https://reyestr.court.gov.ua/)
- Категорія справи і рекомендовані інстанції для фільтра

## 7. ⚠️ КРИТИЧНІ РИЗИКИ (з градацією)
Для КОЖНОГО ризику: **опис → ймовірність → наслідки → як опонент може використати**.
### 🔴 Високі ризики
### 🟡 Середні ризики
### 🟢 Низькі ризики

## 8. 💣 СЛАБКІ МІСЦЯ КЛІЄНТА
Жорстко і чесно — де можуть "продавити", логічні нестикування, слабкі докази, процесуальні пастки.

## 9. ⚔️ СТРАТЕГІЇ ЗАХИСТУ (3 варіанти)
### Стратегія 1 — Агресивна (атака)
### Стратегія 2 — Захисна (оборона)
### Стратегія 3 — Компроміс (мирова)

## 10. 🧠 СТРАТЕГІЯ ОПОНЕНТА
Покрокова модель атаки іншої сторони + що готувати ЗАЗДАЛЕГІДЬ.

## 11. 📜 АНАЛІЗ ДОГОВОРІВ (тільки якщо є договір)
Таблиця ризикових пунктів:
| Пункт | Ризик | Наслідок | Що змінити |
|-------|-------|----------|------------|

## 12. 📉 ФІНАНСОВІ РИЗИКИ
Прямі збитки, штрафи, судові витрати, worst-case / best-case в цифрах.

## 13. 🔍 АНАЛІЗ СТАТУТІВ (тільки якщо застосовно)

## 14. 🛠 РЕКОМЕНДАЦІЇ АДВОКАТУ
Що робити ЗАРАЗ, що НЕ ПІДПИСУВАТИ, які докази запросити.

## 15. 🚀 NEXT STEPS
Покроковий план: дія — хто робить — дедлайн.

## 16. 📎 КОРИСНІ ПОСИЛАННЯ`;

const CLAUDE_REVIEWER_SYSTEM = `Ти — senior партнер юридичної фірми в Україні з 20+ років практики. Твій AI-колега підготував чернетку аналізу справи. Твоя робота — перевірити, виправити та посилити її до рівня, який можна віддати клієнту.

═══ ЩО РОБИТИ ═══

1. ПЕРЕВІР ПОСИЛАННЯ НА ЗАКОН:
   - Кожна стаття кодексу — реально існує? Номер коректний?
   - Якщо номер сумнівний — заміни на [ПЕРЕВІРИТИ] або прибери конкретний номер, лиши назву закону
   - НІКОЛИ не залишай вигадані номери статей

2. ПЕРЕВІР ФАКТИ:
   - Чи всі факти зі справи враховані?
   - Чи немає протиріч у викладі?
   - Чи правильно ідентифіковані сторони і їхні ролі?

3. ПОСИЛЬ СТРАТЕГІЮ:
   - Стратегії мають бути конкретні, не абстрактні
   - Додай пропущені аргументи якщо бачиш
   - Загостри ризики які чернетка пом'якшила

4. ПРИБЕРИ ВОДУ:
   - Видали загальні поради типу "зверніться до юриста"
   - Видали тавтологію
   - Кожне речення має нести конкретну користь адвокату

5. ЗБЕРЕЖИ СТРУКТУРУ:
   - Та сама розбивка по 16 секціях
   - Той самий формат маркерів [ТОЧНО] / [ПЕРЕВІРИТИ]
   - Той самий стиль (markdown, емоджі заголовків)

═══ ВАЖЛИВО ═══

Видавай ФІНАЛЬНУ версію аналізу — те, що піде адвокату. Не пиши "я виправив це" або "колега помилився". Просто видай якісний фінальний документ. Не додавай преамбул і епілогів — одразу починай з "## 1. 📊 ШВИДКИЙ SUMMARY".

Користуйся ТІЛЬКИ реальним законодавством України. Якщо чернетка містить статтю в якій ти не впевнений на 100% — заміни конкретний номер на [ПЕРЕВІРИТИ] з назвою закону, або повністю прибери номер.`;

function buildReviewerUserPrompt(params: {
  documentText: string;
  lawyerTask?: string;
  draft: string;
  hasImages: boolean;
}): string {
  const { documentText, lawyerTask, draft, hasImages } = params;

  let out = "";
  if (lawyerTask) {
    out += `═══ ЗАВДАННЯ ВІД АДВОКАТА ═══\n${lawyerTask}\n\n`;
  }

  if (hasImages) {
    out += `(До справи додані фото документів — їх вже опрацював перший AI, текст витягнутий і врахований у чернетці.)\n\n`;
  }

  out += `═══ ОРИГІНАЛЬНИЙ ТЕКСТ СПРАВИ ═══\n${documentText.slice(0, 30000)}\n\n`;
  out += `═══ ЧЕРНЕТКА АНАЛІЗУ ВІД МОЛОДШОГО КОЛЕГИ ═══\n${draft}\n\n`;
  out += `═══ ТВОЄ ЗАВДАННЯ ═══\nПеревір чернетку, виправ помилки, посиль слабкі місця, прибери воду. Видай ФІНАЛЬНУ версію аналізу в тій самій структурі (16 секцій). Не пиши коментарів про правки — одразу видавай готовий аналіз.`;

  return out;
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Analyze a legal case with images (multimodal).
 * Gemini does the draft (with OCR), Claude reviews.
 */
export async function analyzeLegalCaseWithImages(params: {
  documentText: string;
  images: { mimeType: string; base64: string; fileName: string }[];
  lawyerTask?: string;
  mode?: AnalysisMode;
}): Promise<AnalysisResult> {
  const { documentText, images, lawyerTask, mode = "synergy" } = params;

  const parts: Part[] = [];
  let textPrompt = CASE_ANALYSIS_SYSTEM + "\n\n";
  textPrompt += "═══ ЗАВДАННЯ: Проаналізуй юридичний документ / справу ═══\n\n";

  if (lawyerTask) {
    textPrompt += `═══ ЗАВДАННЯ ВІД АДВОКАТА ═══\n${lawyerTask}\nЗосередься саме на тому, що просить адвокат.\n\n`;
  }

  if (images.length > 0) {
    textPrompt += `До справи додано ${images.length} фото/зображень документів. Уважно прочитай текст на кожному — це частина матеріалів справи.\n\n`;
  }

  if (documentText.trim()) {
    textPrompt += "ТЕКСТ ДОКУМЕНТА:\n---\n" + documentText.slice(0, 25000) + "\n---\n\n";
  }

  textPrompt += ANALYSIS_INSTRUCTIONS;

  parts.push({ text: textPrompt });
  for (const img of images) {
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
  }

  return runSynergy({
    runDraft: async () => callGemini(parts),
    documentText: documentText + (images.length ? `\n\n[+ ${images.length} зображень документів]` : ""),
    lawyerTask,
    hasImages: images.length > 0,
    mode,
  });
}

/**
 * Analyze a legal case (text only).
 */
export async function analyzeLegalCase(
  documentText: string,
  lawyerTask: string = "",
  mode: AnalysisMode = "synergy"
): Promise<AnalysisResult> {
  const taskBlock = lawyerTask
    ? `\n═══ ЗАВДАННЯ ВІД АДВОКАТА ═══\n${lawyerTask}\nЗосередься саме на тому, що просить адвокат.\n\n`
    : "";

  const draftPrompt = `${CASE_ANALYSIS_SYSTEM}

═══ ЗАВДАННЯ: Проаналізуй наступний юридичний документ / справу ═══
${taskBlock}
ТЕКСТ ДОКУМЕНТА:
---
${documentText.slice(0, 30000)}
---

${ANALYSIS_INSTRUCTIONS}`;

  return runSynergy({
    runDraft: async () => callGemini([{ text: draftPrompt }]),
    documentText,
    lawyerTask,
    hasImages: false,
    mode,
  });
}

/**
 * Orchestrator: режим synergy / gemini / claude.
 * Якщо ключа потрібного провайдера немає — graceful fallback на той, що є.
 */
async function runSynergy(params: {
  runDraft: () => Promise<{ text: string; model: string } | null>;
  documentText: string;
  lawyerTask?: string;
  hasImages: boolean;
  mode: AnalysisMode;
}): Promise<AnalysisResult> {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasClaude = !!process.env.ANTHROPIC_API_KEY;
  const { mode } = params;

  if (!hasGemini && !hasClaude) {
    throw new Error("Не налаштовано жодного AI-провайдера (GEMINI_API_KEY або ANTHROPIC_API_KEY)");
  }

  // Користувач явно вибрав Claude-only, або Gemini-ключа немає.
  if ((mode === "claude" && hasClaude) || (!hasGemini && hasClaude)) {
    const claudePrompt = `${params.lawyerTask ? `═══ ЗАВДАННЯ ВІД АДВОКАТА ═══\n${params.lawyerTask}\n\n` : ""}ТЕКСТ ДОКУМЕНТА:\n---\n${params.documentText.slice(0, 30000)}\n---\n\n${ANALYSIS_INSTRUCTIONS}`;
    const claudeRes = await callClaude({
      system: CASE_ANALYSIS_SYSTEM,
      user: claudePrompt,
      maxTokens: 8000,
    });
    if (!claudeRes) throw new Error("Claude недоступний");
    return { text: claudeRes.text, models: [labelFor(claudeRes.model)] };
  }

  // Step 1: Gemini draft.
  const draft = await params.runDraft();
  if (!draft) throw new Error("Gemini недоступний");

  // Користувач явно вибрав Gemini-only, або Claude-ключа немає.
  if (mode === "gemini" || !hasClaude) {
    return { text: draft.text, models: [labelFor(draft.model)] };
  }

  // Step 2: Claude review.
  try {
    const review = await callClaude({
      system: CLAUDE_REVIEWER_SYSTEM,
      user: buildReviewerUserPrompt({
        documentText: params.documentText,
        lawyerTask: params.lawyerTask,
        draft: draft.text,
        hasImages: params.hasImages,
      }),
      maxTokens: 8000,
    });
    if (!review) throw new Error("Claude вернув null");
    return {
      text: review.text,
      models: [labelFor(draft.model), labelFor(review.model)],
    };
  } catch (err) {
    // Якщо Claude впав — повертаємо хоча б Gemini-чернетку, щоб користувач не залишився ні з чим.
    console.error("Claude review failed, returning Gemini draft:", err);
    return { text: draft.text, models: [labelFor(draft.model)] };
  }
}

function labelFor(model: string): string {
  if (model === CLAUDE_MODEL) return CLAUDE_LABEL;
  return GEMINI_LABELS[model] ?? model;
}

// ─── Chat ──────────────────────────────────────────────────────────────────

export interface ChatResult {
  text: string;
  model: string;
}

/**
 * Chat with AI about the case. Uses Claude if available (best for nuanced legal
 * follow-up), falls back to Gemini.
 */
export async function chatAboutCase(params: {
  caseContext: string;
  analysisResult: string;
  chatHistory: { role: "user" | "assistant"; text: string }[];
  question: string;
}): Promise<ChatResult> {
  const { caseContext, analysisResult, chatHistory, question } = params;

  const historyText = chatHistory
    .slice(-10)
    .map((m) => `${m.role === "user" ? "АДВОКАТ" : "ПОМІЧНИК"}: ${m.text}`)
    .join("\n\n");

  const userPrompt = `═══ ТЕКСТ ДОКУМЕНТА (СПРАВА) ═══
${caseContext.slice(0, 20000)}

═══ ПОПЕРЕДНІЙ АНАЛІЗ ЦІЄЇ СПРАВИ ═══
${analysisResult.slice(0, 15000)}

═══ ПОПЕРЕДНІЙ ДІАЛОГ ═══
${historyText || "(початок діалогу)"}

═══ ЗАПИТАННЯ АДВОКАТА ═══
${question}

═══ ПРАВИЛА ВІДПОВІДІ ═══
1. Відповідай КОНКРЕТНО по цій справі, а не загально
2. Називай сторони по імені/назві з документа
3. Посилайся ТІЛЬКИ на реальні статті з позначками [ТОЧНО] / [ПЕРЕВІРИТИ]
4. НІКОЛИ не вигадуй номери справ, статей, дати постанов
5. Для судової практики давай ключові слова для пошуку в ЄДРСР: https://reyestr.court.gov.ua/
6. Прямі посилання на кодекси з https://zakon.rada.gov.ua/
7. Якщо не впевнений — скажи чесно і вкажи де шукати
8. Українською, конкретно, по суті`;

  const chatSystem = `${CASE_ANALYSIS_SYSTEM}

═══ ТВОЯ РОЛЬ В ЦЬОМУ ЧАТІ ═══
Ти — особистий юридичний помічник адвоката. Ти ПОВНІСТЮ володієш контекстом справи, яку адвокат завантажив для аналізу. Адвокат радиться з тобою.

ВАЖЛИВО:
- Ти ЗНАЄШ цю справу — відповідай конкретно, з прив'язкою до фактів
- Не давай загальних відповідей — адвокат очікує конкретику по ЙОГО справі
- Посилайся на факти зі справи, називай сторони по імені`;

  // Try Claude first.
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const res = await callClaude({
        system: chatSystem,
        user: userPrompt,
        maxTokens: 4000,
      });
      if (res) return { text: res.text, model: labelFor(res.model) };
    } catch (err) {
      console.error("Claude chat failed, falling back to Gemini:", err);
    }
  }

  // Gemini fallback.
  const gem = await callGemini([{ text: chatSystem + "\n\n" + userPrompt }]);
  if (!gem) throw new Error("Жоден AI-провайдер не доступний");
  return { text: gem.text, model: labelFor(gem.model) };
}
