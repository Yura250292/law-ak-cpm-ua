/**
 * AI Case Analyzer — analyses legal cases for the lawyer.
 * Extracts key points, finds relevant law, suggests strategy.
 * Uses ONLY real Ukrainian legislation — never fabricates.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY не налаштовано");
  return new GoogleGenerativeAI(apiKey);
}

async function callAI(prompt: string): Promise<string> {
  const genAI = getGenAI();
  let lastError: Error | null = null;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
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
 * Analyze a legal case document.
 */
export async function analyzeLegalCase(documentText: string): Promise<string> {
  const prompt = `${CASE_ANALYSIS_SYSTEM}

═══════════════════════════════════════════════
ЗАВДАННЯ: Проаналізуй наступний юридичний документ / справу
═══════════════════════════════════════════════

ТЕКСТ ДОКУМЕНТА:
---
${documentText.slice(0, 30000)}
---

Надай структурований аналіз:

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

  return callAI(prompt);
}

/**
 * Chat with AI about a case — follow-up questions.
 */
export async function chatAboutCase(params: {
  caseContext: string;
  chatHistory: { role: "user" | "assistant"; text: string }[];
  question: string;
}): Promise<string> {
  const { caseContext, chatHistory, question } = params;

  const historyText = chatHistory
    .slice(-10) // last 10 messages for context
    .map((m) => `${m.role === "user" ? "АДВОКАТ" : "ПОМІЧНИК"}: ${m.text}`)
    .join("\n\n");

  const prompt = `${CASE_ANALYSIS_SYSTEM}

═══ КОНТЕКСТ СПРАВИ ═══
${caseContext.slice(0, 15000)}

═══ ПОПЕРЕДНІЙ ДІАЛОГ ═══
${historyText || "(початок діалогу)"}

═══ ЗАПИТАННЯ АДВОКАТА ═══
${question}

═══ ІНСТРУКЦІЇ ═══
Відповідай як висококваліфікований помічник адвоката:
- Давай конкретні, практичні відповіді
- Посилайся на реальні статті законів з позначками [ТОЧНО] / [ПЕРЕВІРИТИ]
- Якщо просять знайти судову практику — дай ключові слова для пошуку в ЄДРСР та пряме посилання: https://reyestr.court.gov.ua/
- Якщо просять знайти статтю кодексу — дай посилання на zakon.rada.gov.ua
- Для Кодексу адміністративного судочинства: https://zakon.rada.gov.ua/laws/show/2747-15
- Для Цивільного кодексу: https://zakon.rada.gov.ua/laws/show/435-15
- Для Сімейного кодексу: https://zakon.rada.gov.ua/laws/show/2947-14
- Для ЦПК: https://zakon.rada.gov.ua/laws/show/1618-15
- Для Кримінального кодексу: https://zakon.rada.gov.ua/laws/show/2341-14
- Для КПК: https://zakon.rada.gov.ua/laws/show/4651-17
- НІКОЛИ не вигадуй номери справ чи статей
- Якщо не знаєш точну відповідь — скажи чесно і порекомендуй де шукати

Відповідай українською мовою. Будь конкретним та корисним.`;

  return callAI(prompt);
}
