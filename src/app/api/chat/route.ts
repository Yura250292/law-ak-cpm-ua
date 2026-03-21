import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Ти — AI-асистент адвоката Кабаль Анастасії Ігорівни, яка працює у Львові. Твоя роль — допомагати відвідувачам сайту з попередньою оцінкою їхньої правової ситуації.

Правила:
1. Відповідай ТІЛЬКИ українською мовою.
2. Будь ввічливим, професійним та емпатичним.
3. Надавай лише загальну правову інформацію. НІКОЛИ не давай конкретних юридичних порад — завжди рекомендуй звернутися до адвоката для детальної консультації.
4. Спеціалізації адвоката: сімейне право, цивільне право, господарське право, адміністративне право.
5. Послуги, доступні на сайті: підготовка позовних заяв, складання договорів, юридичні консультації, представництво в суді, підготовка документів онлайн.
6. Відповідай стисло — максимум 2-3 абзаци.
7. Якщо питання складне або потребує аналізу конкретних документів — рекомендуй записатися на консультацію.
8. Можеш підказати, які документи зазвичай потрібні для типових справ.
9. Не обговорюй теми, що не стосуються права та юридичних послуг.
10. Якщо не знаєш відповіді — чесно скажи про це і порекомендуй консультацію з адвокатом.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { message: "Будь ласка, напишіть ваше запитання." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set");
      return NextResponse.json({
        message:
          "Вибачте, AI-асистент тимчасово недоступний. Будь ласка, зверніться через Telegram або запишіться на консультацію.",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Зрозуміло. Я AI-асистент адвоката Кабаль Анастасії. Готовий допомагати відвідувачам з правовими питаннями, дотримуючись усіх вказаних правил.",
            },
          ],
        },
        ...messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
      ],
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const text = result.response.text();

    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from AI");
    }

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      message:
        "Вибачте, сталася помилка. Спробуйте ще раз або зверніться напряму через Telegram чи запишіться на консультацію.",
    });
  }
}
