/**
 * AI Case Analyzer — analyses legal cases for the lawyer.
 * Extracts key points, finds relevant law, suggests strategy.
 * Uses ONLY real Ukrainian legislation — never fabricates.
 */
import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY не налаштовано");
  return new GoogleGenerativeAI(apiKey);
}

async function callAI(prompt: string): Promise<string> {
  return callAIMultimodal([{ text: prompt }]);
}

async function callAIMultimodal(parts: Part[]): Promise<string> {
  const genAI = getGenAI();
  let lastError: Error | null = null;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(parts);
      const text = result.response.text();
      if (!text?.trim()) throw new Error("Empty response");
      return text;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (
        error instanceof Error &&
        (error.message.includes("429") || error.message.includes("404"))
      ) {
        continue;
      }
      throw lastError;
    }
  }
  throw new Error(`AI недоступний: ${lastError?.message}`);
}

const CASE_ANALYSIS_SYSTEM = `Ти — висококваліфікований AI-помічник адвоката в Україні. Ти аналізуєш судові справи та юридичні документи.

═══ ТВОЯ РОЛЬ ═══
Ти допомагаєш адвокату аналізувати справи:
- Знаходиш ключові моменти та факти
- Визначаєш правову кваліфікацію
- Шукаєш релевантні норми чинного законодавства
- Пропонуєш стратегію вирішення
- Вказуєш на ризики та слабкі місця

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
   - ЄДРСР (Єдиний державний реєстр судових рішень): https://reyestr.court.gov.ua/
   - Верховна Рада (законодавство): https://zakon.rada.gov.ua/
   - Верховний Суд: https://supreme.court.gov.ua/

4. САМОПЕРЕВІРКА:
   - Перед видачею перевір кожне посилання на статтю
   - Вказуй рівень впевненості: [ТОЧНО] / [ПЕРЕВІРИТИ]
   - Якщо є сумніви — краще напиши "рекомендую перевірити" ніж видати помилкове посилання`;

/**
 * Analyze a legal case with images (multimodal).
 * Images are sent to Gemini for OCR + analysis.
 */
export async function analyzeLegalCaseWithImages(params: {
  documentText: string;
  images: { mimeType: string; base64: string; fileName: string }[];
  lawyerTask?: string;
}): Promise<string> {
  const { documentText, images, lawyerTask } = params;

  const parts: Part[] = [];

  // System prompt + text
  let textPrompt = CASE_ANALYSIS_SYSTEM + "\n\n";
  textPrompt += "═══════════════════════════════════════════════\n";
  textPrompt += "ЗАВДАННЯ: Проаналізуй юридичний документ / справу\n";
  textPrompt += "═══════════════════════════════════════════════\n\n";

  if (lawyerTask) {
    textPrompt += "═══ ЗАВДАННЯ ВІД АДВОКАТА ═══\n";
    textPrompt += `Адвокат просить: ${lawyerTask}\n`;
    textPrompt += "Врахуй це завдання при аналізі — зосередься саме на тому, що просить адвокат.\n\n";
  }

  if (images.length > 0) {
    textPrompt += `До справи додано ${images.length} фото/зображень документів. Уважно прочитай текст на кожному зображенні та використай його для аналізу.\n\n`;
  }

  if (documentText.trim()) {
    textPrompt += "ТЕКСТ ДОКУМЕНТА:\n---\n" + documentText.slice(0, 25000) + "\n---\n\n";
  }

  textPrompt += ANALYSIS_INSTRUCTIONS;

  parts.push({ text: textPrompt });

  // Add images
  for (const img of images) {
    parts.push({
      inlineData: {
        mimeType: img.mimeType,
        data: img.base64,
      },
    });
  }

  return callAIMultimodal(parts);
}

const ANALYSIS_INSTRUCTIONS = `Надай структурований аналіз:

## 1. РЕЗЮМЕ СПРАВИ
Короткий виклад суті справи (3-5 речень).

## 2. КЛЮЧОВІ ФАКТИ
Пронумерований перелік ключових фактів та обставин.

## 3. СТОРОНИ СПРАВИ
Хто є сторонами, їх ролі та інтереси.

## 4. ПРАВОВА КВАЛІФІКАЦІЯ
- Яка галузь права (цивільне, сімейне, адміністративне, кримінальне тощо)
- Які правовідносини виникли
- Юрисдикція (який суд розглядає)

## 5. ЗАСТОСОВНЕ ЗАКОНОДАВСТВО
Перелічи ВСІ релевантні нормативні акти та статті:
- Для кожної статті вкажи [ТОЧНО] або [ПЕРЕВІРИТИ]
- Вкажи що саме регулює ця норма
- Дай посилання на zakon.rada.gov.ua де можливо

## 6. СУДОВА ПРАКТИКА
- Загальні правові позиції ВС по аналогічних справах
- Рекомендації щодо пошуку практики в ЄДРСР (https://reyestr.court.gov.ua/)
- Ключові слова для пошуку

## 7. СТРАТЕГІЯ ВИРІШЕННЯ
### Для позивача / заявника:
- Сильні аргументи
- Рекомендовані дії
- Які докази зібрати

### Для відповідача (якщо застосовно):
- Можливі контраргументи
- Лінія захисту

## 8. РИЗИКИ ТА ЗАСТЕРЕЖЕННЯ
- Слабкі місця позиції
- Процесуальні ризики
- На що звернути особливу увагу

## 9. РЕКОМЕНДАЦІЇ АДВОКАТУ
- Конкретні кроки для роботи над справою
- Які документи запросити
- Тактичні поради

## 10. КОРИСНІ ПОСИЛАННЯ
- Законодавство: https://zakon.rada.gov.ua/
- Реєстр судових рішень: https://reyestr.court.gov.ua/
- Конкретні посилання на статті законів (zakon.rada.gov.ua/laws/show/...)`;

/**
 * Analyze a legal case document (text only).
 */
export async function analyzeLegalCase(
  documentText: string,
  lawyerTask: string = ""
): Promise<string> {
  let taskBlock = "";
  if (lawyerTask) {
    taskBlock = `\n═══ ЗАВДАННЯ ВІД АДВОКАТА ═══\nАдвокат просить: ${lawyerTask}\nВрахуй це завдання при аналізі — зосередься саме на тому, що просить адвокат. Якщо адвокат просить хронологію кроків, план дій, підготовку документа — зроби це в першу чергу.\n\n`;
  }

  const prompt = `${CASE_ANALYSIS_SYSTEM}

═══════════════════════════════════════════════
ЗАВДАННЯ: Проаналізуй наступний юридичний документ / справу
═══════════════════════════════════════════════
${taskBlock}
ТЕКСТ ДОКУМЕНТА:
---
${documentText.slice(0, 30000)}
---

${ANALYSIS_INSTRUCTIONS}`;

  return callAI(prompt);
}

/**
 * Chat with AI about a case — follow-up questions.
 * Receives BOTH the original document AND the analysis results for full context.
 */
export async function chatAboutCase(params: {
  caseContext: string;
  analysisResult: string;
  chatHistory: { role: "user" | "assistant"; text: string }[];
  question: string;
}): Promise<string> {
  const { caseContext, analysisResult, chatHistory, question } = params;

  const historyText = chatHistory
    .slice(-10)
    .map((m) => `${m.role === "user" ? "АДВОКАТ" : "ПОМІЧНИК"}: ${m.text}`)
    .join("\n\n");

  const prompt = `${CASE_ANALYSIS_SYSTEM}

═══ ТВОЯ РОЛЬ В ЦЬОМУ ЧАТІ ═══

Ти — особистий юридичний помічник адвоката. Ти ПОВНІСТЮ володієш контекстом справи, яку адвокат завантажив для аналізу. Ти вже проаналізував цю справу і знаєш усі деталі. Адвокат зараз радиться з тобою.

ВАЖЛИВО:
- Ти ЗНАЄШ цю справу — відповідай конкретно, з прив'язкою до фактів САМЕ ЦІЄЇ справи
- Не давай загальних відповідей — адвокат очікує конкретику по ЙОГО справі
- Посилайся на факти зі справи, називай сторони по імені
- Якщо адвокат питає про судову практику — давай конкретні ключові слова для пошуку в ЄДРСР саме по цій категорії справ
- Якщо питає про статтю кодексу — давай пряме посилання

═══ ТЕКСТ ДОКУМЕНТА (СПРАВА) ═══
${caseContext.slice(0, 20000)}

═══ ТВІЙ ПОПЕРЕДНІЙ АНАЛІЗ ЦІЄЇ СПРАВИ ═══
${analysisResult.slice(0, 15000)}

═══ ПОПЕРЕДНІЙ ДІАЛОГ З АДВОКАТОМ ═══
${historyText || "(початок діалогу)"}

═══ ЗАПИТАННЯ АДВОКАТА ═══
${question}

═══ ПРАВИЛА ВІДПОВІДІ ═══
1. Відповідай КОНКРЕТНО по цій справі, а не загально
2. Називай сторони по імені/назві з документа
3. Посилайся ТІЛЬКИ на реальні статті з позначками [ТОЧНО] / [ПЕРЕВІРИТИ]
4. НІКОЛИ не вигадуй:
   - Номери судових справ
   - Номери статей законів
   - Дати постанов
   - Посилання на неіснуючі рішення
5. Для судової практики:
   - Давай ключові слова для пошуку в ЄДРСР: https://reyestr.court.gov.ua/
   - Вказуй категорію справи для фільтрації
   - Рекомендуй конкретні суди (ВС, апеляція, перша інстанція)
6. Для статей кодексів — давай прямі посилання:
   - Конституція: https://zakon.rada.gov.ua/laws/show/254к/96-вр
   - Цивільний кодекс: https://zakon.rada.gov.ua/laws/show/435-15
   - Сімейний кодекс: https://zakon.rada.gov.ua/laws/show/2947-14
   - ЦПК: https://zakon.rada.gov.ua/laws/show/1618-15
   - Кримінальний кодекс: https://zakon.rada.gov.ua/laws/show/2341-14
   - КПК: https://zakon.rada.gov.ua/laws/show/4651-17
   - КАС: https://zakon.rada.gov.ua/laws/show/2747-15
   - Господарський кодекс: https://zakon.rada.gov.ua/laws/show/436-15
   - ГПК: https://zakon.rada.gov.ua/laws/show/1798-12
   - КУпАП: https://zakon.rada.gov.ua/laws/show/8073-10
   - Закон "Про судовий збір": https://zakon.rada.gov.ua/laws/show/3674-17
   - Закон "Про виконавче провадження": https://zakon.rada.gov.ua/laws/show/1404-19
7. Якщо не впевнений — скажи чесно і вкажи де адвокату шукати
8. Відповідай українською, будь конкретним і корисним`;

  return callAI(prompt);
}
