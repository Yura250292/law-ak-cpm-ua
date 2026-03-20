export function buildPrompt(params: {
  templateTitle: string;
  promptHint: string;
  partyData: Record<string, unknown>;
  circumstancesData: Record<string, unknown>;
  requirementsData: Record<string, unknown>;
}): string {
  const { templateTitle, promptHint, partyData, circumstancesData, requirementsData } = params;

  const plaintiff = (partyData.plaintiff ?? {}) as Record<string, string>;
  const defendant = (partyData.defendant ?? {}) as Record<string, string>;
  const demands = (requirementsData.demands ?? []) as string[];
  const courtName = (requirementsData.courtName as string) ?? "";

  const sections: string[] = [
    `Ти — досвідчений український юрист-процесуаліст. Склади юридичний документ: "${templateTitle}".`,
    "",
    promptHint ? `Додаткові вказівки: ${promptHint}` : "",
    "",
    "=== ДАНІ СТОРІН ===",
    "",
    "Позивач:",
    plaintiff.fullName ? `  ПІБ: ${plaintiff.fullName}` : "",
    plaintiff.birthDate ? `  Дата народження: ${plaintiff.birthDate}` : "",
    plaintiff.registrationAddress
      ? `  Адреса реєстрації: ${plaintiff.registrationAddress}`
      : "",
    plaintiff.actualAddress ? `  Фактична адреса: ${plaintiff.actualAddress}` : "",
    plaintiff.phone ? `  Телефон: ${plaintiff.phone}` : "",
    plaintiff.ipn ? `  ІПН: ${plaintiff.ipn}` : "",
    "",
    "Відповідач:",
    defendant.fullName ? `  ПІБ: ${defendant.fullName}` : "",
    defendant.birthDate ? `  Дата народження: ${defendant.birthDate}` : "",
    defendant.registrationAddress
      ? `  Адреса: ${defendant.registrationAddress}`
      : "",
    defendant.actualAddress ? `  Фактична адреса: ${defendant.actualAddress}` : "",
    defendant.phone ? `  Телефон: ${defendant.phone}` : "",
    "",
    "=== ОБСТАВИНИ СПРАВИ ===",
    "",
    ...Object.entries(circumstancesData).map(([key, value]) => {
      if (typeof value === "boolean") {
        return `${key}: ${value ? "Так" : "Ні"}`;
      }
      return value ? `${key}: ${value}` : "";
    }),
    "",
    "=== ВИМОГИ ===",
    "",
    courtName ? `Суд: ${courtName}` : "",
    demands.length > 0
      ? `Позовні вимоги:\n${demands.map((d, i) => `  ${i + 1}. ${d}`).join("\n")}`
      : "",
    (requirementsData.additionalNotes as string)
      ? `Додаткові зауваження: ${requirementsData.additionalNotes}`
      : "",
    "",
    "=== ІНСТРУКЦІЇ ===",
    "",
    "1. Документ повинен відповідати вимогам Цивільного процесуального кодексу України (ЦПК).",
    "2. Посилайся на відповідні статті Сімейного кодексу, Цивільного кодексу, ЦПК та інших релевантних законів України.",
    "3. Використовуй офіційний юридичний стиль української мови.",
    "4. Структура документа: шапка (суд, сторони), вступна частина, описова частина (обставини), мотивувальна частина (правові підстави), прохальна частина (вимоги), додатки.",
    "5. Всі дати записуй у форматі «ДД.ММ.РРРР».",
    "6. Не додавай коментарів чи пояснень — лише текст документа.",
  ];

  return sections.filter((line) => line !== "").join("\n");
}
