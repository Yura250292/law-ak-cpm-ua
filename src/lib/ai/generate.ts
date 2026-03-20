import { GoogleGenerativeAI } from "@google/generative-ai";

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

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash-preview" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text || text.trim().length === 0) {
      throw new Error("AI returned empty response");
    }

    return text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(
      `Помилка генерації тексту: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
