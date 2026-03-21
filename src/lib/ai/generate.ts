import { GoogleGenerativeAI } from "@google/generative-ai";

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash-lite"];

export async function generateLegalText(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set — returning placeholder text.");
    return [
      "[PLACEHOLDER — GEMINI_API_KEY не налаштовано]",
      "",
      "Цей документ було б згенеровано тут за допомогою AI.",
      "Будь ласка, налаштуйте змінну середовища GEMINI_API_KEY для повноцінної генерації.",
      "",
      "--- Промпт, який було б надіслано ---",
      prompt.slice(0, 500) + (prompt.length > 500 ? "..." : ""),
    ].join("\n");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: Error | null = null;

  for (const modelName of MODELS) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (!text || text.trim().length === 0) {
        throw new Error("AI returned empty response");
      }

      console.log(`Success with model: ${modelName}`);
      return text;
    } catch (error) {
      console.error(`Model ${modelName} failed:`, error instanceof Error ? error.message : error);
      lastError = error instanceof Error ? error : new Error(String(error));

      // If it's a rate limit error (429), try next model
      if (error instanceof Error && error.message.includes("429")) {
        continue;
      }
      // If it's a 404 (model not found), try next model
      if (error instanceof Error && error.message.includes("404")) {
        continue;
      }
      // For other errors, throw immediately
      throw new Error(
        `Помилка генерації тексту: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  throw new Error(
    `Всі моделі AI недоступні. Остання помилка: ${lastError?.message ?? "Unknown"}`
  );
}
