/**
 * Build a detailed, template-specific prompt for Ukrainian legal document generation.
 */
export function buildPrompt(params: {
  templateSlug: string;
  templateTitle: string;
  promptHint: string;
  formData: Record<string, any>;
}): string {
  const { templateSlug, templateTitle, promptHint, formData } = params;

  switch (templateSlug) {
    case "pozov-pro-rozirvannnya-shlyubu":
      return buildDivorcePrompt(templateTitle, promptHint, formData);
    case "pozov-pro-stygnennya-alimentiv":
      return buildAlimonyPrompt(templateTitle, promptHint, formData);
    case "pozov-pro-vidshkoduvannya-shkody":
      return buildDamagesPrompt(templateTitle, promptHint, formData);
    default:
      return buildGenericPrompt(templateTitle, promptHint, formData);
  }
}

// ─── Helpers ───────────────────────────────────────────

/** Safely get a nested value like "plaintiff.fullName" from flat or nested formData */
function getField(formData: Record<string, any>, path: string): string {
  // Try direct key first
  if (formData[path] !== undefined && formData[path] !== null && formData[path] !== "") {
    return String(formData[path]);
  }
  // Try nested
  const parts = path.split(".");
  let current: any = formData;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return "";
    current = current[part];
  }
  if (current === undefined || current === null || current === "") return "";
  return String(current);
}

/** Format a field line: returns empty string if value missing */
function line(label: string, formData: Record<string, any>, path: string): string {
  const val = getField(formData, path);
  return val ? `- ${label}: ${val}` : "";
}

/** Dump ALL formData fields into a readable block (for completeness) */
function dumpAllFields(formData: Record<string, any>, indent = ""): string {
  const lines: string[] = [];

  function walk(obj: Record<string, any>, prefix: string) {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value === null || value === undefined || value === "") continue;
      if (typeof value === "object" && !Array.isArray(value)) {
        walk(value as Record<string, any>, fullKey);
      } else if (typeof value === "boolean") {
        lines.push(`${indent}${fullKey}: ${value ? "Так" : "Ні"}`);
      } else {
        lines.push(`${indent}${fullKey}: ${value}`);
      }
    }
  }

  walk(formData, "");
  return lines.join("\n");
}

// ─── Divorce ───────────────────────────────────────────

function buildDivorcePrompt(
  templateTitle: string,
  promptHint: string,
  formData: Record<string, any>
): string {
  const sections: string[] = [];

  sections.push(
    `Ти — досвідчений український юрист-процесуаліст. Склади ПОЗОВНУ ЗАЯВУ ПРО РОЗІРВАННЯ ШЛЮБУ.`,
    "",
    "СУВОРІ ВИМОГИ ДО ДОКУМЕНТА:",
    "1. Документ має відповідати вимогам ст. 175 ЦПК України.",
    "2. Посилання на ст. 105, 107, 109, 110 Сімейного кодексу України.",
    "3. Офіційний юридичний стиль українською мовою.",
    "4. Формат: шапка → вступна частина → описова частина → мотивувальна частина → прохальна частина → додатки.",
    ""
  );

  if (promptHint) {
    sections.push(`Додаткові вказівки: ${promptHint}`, "");
  }

  // Plaintiff
  sections.push(
    "ДАНІ ПОЗИВАЧА:",
    ...[
      line("ПІБ", formData, "plaintiff.fullName"),
      line("Дата народження", formData, "plaintiff.birthDate"),
      line("ІПН", formData, "plaintiff.ipn"),
      line("Адреса реєстрації", formData, "plaintiff.registrationAddress"),
      line("Фактична адреса", formData, "plaintiff.actualAddress"),
      line("Телефон", formData, "plaintiff.phone"),
    ].filter(Boolean),
    ""
  );

  // Defendant
  sections.push(
    "ДАНІ ВІДПОВІДАЧА:",
    ...[
      line("ПІБ", formData, "defendant.fullName"),
      line("Дата народження", formData, "defendant.birthDate"),
      line("Адреса реєстрації", formData, "defendant.registrationAddress"),
      line("Фактична адреса", formData, "defendant.actualAddress"),
      line("Телефон", formData, "defendant.phone"),
    ].filter(Boolean),
    ""
  );

  // Marriage & circumstances
  sections.push(
    "ОБСТАВИНИ СПРАВИ:",
    ...[
      line("Дата реєстрації шлюбу", formData, "marriageDate"),
      line("Місце реєстрації шлюбу", formData, "marriagePlace"),
      line("Дата припинення спільного проживання", formData, "separationDate"),
      line("Є спільні неповнолітні діти", formData, "hasChildren"),
      line("Дані дітей", formData, "childrenDetails"),
      line("З ким мають проживати діти", formData, "childResidence"),
      line("Є питання поділу майна", formData, "hasProperty"),
      line("Опис спільного майна", formData, "propertyDetails"),
      line("Причина розірвання шлюбу", formData, "divorceReason"),
    ].filter(Boolean),
    ""
  );

  // Court & demands
  sections.push(
    "ВИМОГИ:",
    ...[
      line("Назва суду", formData, "courtName"),
      line("Додаткові вимоги", formData, "additionalDemands"),
    ].filter(Boolean),
    ""
  );

  sections.push(
    "СТРУКТУРА ДОКУМЕНТА:",
    '1. Шапка: "До [назва суду]", потім дані позивача і відповідача з адресами.',
    '2. Заголовок: "ПОЗОВНА ЗАЯВА про розірвання шлюбу".',
    "3. Вступ: коли зареєстровано шлюб, де, номер актового запису.",
    "4. Описова частина: коли припинилося спільне проживання, причини розпаду шлюбу, інформація про дітей.",
    "5. Мотивувальна частина: правове обґрунтування з посиланнями на конкретні статті СК та ЦПК України.",
    '6. Прохальна частина: "ПРОШУ:" з конкретними вимогами (розірвати шлюб, визначити проживання дітей тощо).',
    '7. "Додатки:" — перелік документів (копія позовної заяви, свідоцтво про шлюб, свідоцтва про народження дітей, квитанція про сплату судового збору тощо).',
    "8. Дата, підпис позивача.",
    "",
    "НЕ ДОДАВАЙ жодних коментарів чи пояснень — тільки текст документа."
  );

  return sections.join("\n");
}

// ─── Alimony ───────────────────────────────────────────

function buildAlimonyPrompt(
  templateTitle: string,
  promptHint: string,
  formData: Record<string, any>
): string {
  const sections: string[] = [];

  sections.push(
    `Ти — досвідчений український юрист-процесуаліст. Склади ПОЗОВНУ ЗАЯВУ ПРО СТЯГНЕННЯ АЛІМЕНТІВ НА УТРИМАННЯ ДИТИНИ.`,
    "",
    "СУВОРІ ВИМОГИ ДО ДОКУМЕНТА:",
    "1. Документ має відповідати вимогам ст. 175 ЦПК України.",
    "2. Посилання на ст. 180, 181, 182, 183, 184, 185, 188, 189, 190, 192, 194, 195, 196, 198 Сімейного кодексу України.",
    "3. Мінімальний розмір аліментів — 50% прожиткового мінімуму для дитини відповідного віку (ст. 182 СК).",
    "4. Офіційний юридичний стиль українською мовою.",
    "5. Формат: шапка → вступна частина → описова частина → мотивувальна частина → прохальна частина → додатки.",
    ""
  );

  if (promptHint) {
    sections.push(`Додаткові вказівки: ${promptHint}`, "");
  }

  // Plaintiff
  sections.push(
    "ДАНІ ПОЗИВАЧА (той, з ким проживає дитина):",
    ...[
      line("ПІБ", formData, "plaintiff.fullName"),
      line("Дата народження", formData, "plaintiff.birthDate"),
      line("Адреса реєстрації", formData, "plaintiff.registrationAddress"),
      line("Телефон", formData, "plaintiff.phone"),
    ].filter(Boolean),
    ""
  );

  // Defendant
  sections.push(
    "ДАНІ ВІДПОВІДАЧА (батько/мати, який не утримує дитину):",
    ...[
      line("ПІБ", formData, "defendant.fullName"),
      line("Дата народження", formData, "defendant.birthDate"),
      line("Адреса реєстрації", formData, "defendant.registrationAddress"),
      line("Телефон", formData, "defendant.phone"),
      line("Місце роботи", formData, "defendant.workplace"),
      line("Посада", formData, "defendant.position"),
    ].filter(Boolean),
    ""
  );

  // Child info
  sections.push(
    "ДАНІ ПРО ДИТИНУ:",
    ...[
      line("ПІБ дитини", formData, "childName"),
      line("Дата народження дитини", formData, "childBirthDate"),
      line("Свідоцтво про народження", formData, "childBirthCertificate"),
    ].filter(Boolean),
    ""
  );

  // Circumstances
  sections.push(
    "ОБСТАВИНИ СПРАВИ:",
    ...[
      line("Дата реєстрації шлюбу", formData, "marriageDate"),
      line("Дата розірвання шлюбу", formData, "divorceDate"),
      line("Дитина проживає з позивачем", formData, "childLivesWithPlaintiff"),
      line("Відповідач не утримує дитину", formData, "defendantDoesNotSupport"),
      line("Щомісячні витрати на дитину", formData, "childNeeds"),
      line("Відомості про доходи відповідача", formData, "defendantIncome"),
    ].filter(Boolean),
    ""
  );

  // Aliment type & amount
  const alimentType = getField(formData, "alimentType");
  const alimentLabels: Record<string, string> = {
    quarter: "1/4 частину всіх доходів відповідача (на 1 дитину)",
    third: "1/3 частину всіх доходів відповідача (на 2 дітей)",
    half: "1/2 частину всіх доходів відповідача (на 3+ дітей)",
    fixed: "тверду грошову суму",
  };

  sections.push(
    "РОЗМІР АЛІМЕНТІВ:",
    `- Спосіб стягнення: ${alimentLabels[alimentType] ?? alimentType}`,
    ...[
      line("Сума у твердій грошовій сумі (грн/міс)", formData, "alimentFixedAmount"),
    ].filter(Boolean),
    ""
  );

  // Court & demands
  sections.push(
    "ВИМОГИ:",
    ...[
      line("Назва суду", formData, "courtName"),
      line("Додаткові вимоги", formData, "additionalDemands"),
    ].filter(Boolean),
    ""
  );

  sections.push(
    "СТРУКТУРА ДОКУМЕНТА:",
    '1. Шапка: "До [назва суду]", дані позивача і відповідача.',
    '2. Заголовок: "ПОЗОВНА ЗАЯВА про стягнення аліментів на утримання дитини".',
    "3. Вступ: хто є батьками дитини, коли народжена дитина.",
    "4. Описова частина: з ким проживає дитина, чи бере відповідач участь у утриманні, розмір витрат на дитину.",
    "5. Мотивувальна частина: правове обґрунтування з посиланнями на конкретні статті СК України (ст. 180-198).",
    "6. Розрахунок аліментів: вказати конкретну суму або частку доходу згідно закону.",
    '7. Прохальна частина: "ПРОШУ:" — стягнути аліменти у вказаному розмірі.',
    '8. "Додатки:" — свідоцтво про народження, довідки, докази витрат тощо.',
    "9. Дата, підпис позивача.",
    "",
    "НЕ ДОДАВАЙ жодних коментарів чи пояснень — тільки текст документа."
  );

  return sections.join("\n");
}

// ─── Damages ───────────────────────────────────────────

function buildDamagesPrompt(
  templateTitle: string,
  promptHint: string,
  formData: Record<string, any>
): string {
  const sections: string[] = [];

  sections.push(
    `Ти — досвідчений український юрист-процесуаліст. Склади ПОЗОВНУ ЗАЯВУ ПРО ВІДШКОДУВАННЯ ШКОДИ.`,
    "",
    "СУВОРІ ВИМОГИ ДО ДОКУМЕНТА:",
    "1. Документ має відповідати вимогам ст. 175 ЦПК України.",
    "2. Посилання на ст. 1166, 1167, 1168 Цивільного кодексу України (відшкодування майнової шкоди).",
    "3. Для моральної шкоди — ст. 23 ЦК України та Постанова Пленуму ВСУ №4 від 31.03.1995.",
    "4. Офіційний юридичний стиль українською мовою.",
    "5. Формат: шапка → вступна частина → описова частина → мотивувальна частина → прохальна частина → додатки.",
    ""
  );

  if (promptHint) {
    sections.push(`Додаткові вказівки: ${promptHint}`, "");
  }

  // Plaintiff
  sections.push(
    "ДАНІ ПОЗИВАЧА (потерпілий):",
    ...[
      line("ПІБ", formData, "plaintiff.fullName"),
      line("Дата народження", formData, "plaintiff.birthDate"),
      line("Адреса реєстрації", formData, "plaintiff.registrationAddress"),
      line("Телефон", formData, "plaintiff.phone"),
    ].filter(Boolean),
    ""
  );

  // Defendant
  sections.push(
    "ДАНІ ВІДПОВІДАЧА (заподіювач шкоди):",
    ...[
      line("ПІБ / Назва юридичної особи", formData, "defendant.fullName"),
      line("Адреса / Юридична адреса", formData, "defendant.registrationAddress"),
      line("Код ЄДРПОУ", formData, "defendant.edrpou"),
      line("Телефон", formData, "defendant.phone"),
    ].filter(Boolean),
    ""
  );

  // Incident
  sections.push(
    "ОБСТАВИНИ ЗАВДАННЯ ШКОДИ:",
    ...[
      line("Дата інциденту", formData, "incidentDate"),
      line("Місце інциденту", formData, "incidentPlace"),
      line("Опис обставин", formData, "incidentDescription"),
    ].filter(Boolean),
    ""
  );

  // Damage details
  const damageType = getField(formData, "damageType");
  const damageLabels: Record<string, string> = {
    material: "Матеріальна шкода",
    moral: "Моральна шкода",
    both: "Матеріальна та моральна шкода",
  };

  sections.push(
    "РОЗМІР ШКОДИ:",
    `- Вид шкоди: ${damageLabels[damageType] ?? damageType}`,
    ...[
      line("Сума матеріальної шкоди (грн)", formData, "materialDamageAmount"),
      line("Розрахунок матеріальної шкоди", formData, "materialDamageDetails"),
      line("Сума моральної шкоди (грн)", formData, "moralDamageAmount"),
      line("Обґрунтування моральної шкоди", formData, "moralDamageJustification"),
      line("Загальна сума позову (грн)", formData, "totalCompensation"),
    ].filter(Boolean),
    ""
  );

  // Evidence
  sections.push(
    "ДОКАЗИ:",
    ...[
      line("Наявні докази", formData, "evidence"),
    ].filter(Boolean),
    ""
  );

  // Court & demands
  sections.push(
    "ВИМОГИ:",
    ...[
      line("Назва суду", formData, "courtName"),
      line("Додаткові вимоги", formData, "additionalDemands"),
    ].filter(Boolean),
    ""
  );

  sections.push(
    "СТРУКТУРА ДОКУМЕНТА:",
    '1. Шапка: "До [назва суду]", дані позивача і відповідача.',
    '2. Заголовок: "ПОЗОВНА ЗАЯВА про відшкодування матеріальної (та/або моральної) шкоди".',
    "3. Вступ: стислий опис суті спору.",
    "4. Описова частина: детальний виклад обставин інциденту, завданої шкоди.",
    "5. Мотивувальна частина: правове обґрунтування з посиланнями на ст. 1166-1168, 23 ЦК України, ЦПК.",
    "6. Розрахунок шкоди: детальний розрахунок матеріальної та/або моральної шкоди.",
    '7. Прохальна частина: "ПРОШУ:" — стягнути конкретні суми з розбивкою.',
    '8. "Додатки:" — перелік доказів (медичні довідки, акти, фото, чеки, показання свідків тощо).',
    "9. Дата, підпис позивача.",
    "",
    "НЕ ДОДАВАЙ жодних коментарів чи пояснень — тільки текст документа."
  );

  return sections.join("\n");
}

// ─── Generic ───────────────────────────────────────────

function buildGenericPrompt(
  templateTitle: string,
  promptHint: string,
  formData: Record<string, any>
): string {
  const sections: string[] = [];

  sections.push(
    `Ти — досвідчений український юрист-процесуаліст. Склади юридичний документ: "${templateTitle}".`,
    "",
    "СУВОРІ ВИМОГИ ДО ДОКУМЕНТА:",
    "1. Документ має відповідати вимогам Цивільного процесуального кодексу України (ЦПК).",
    "2. Посилайся на відповідні статті Сімейного кодексу, Цивільного кодексу, ЦПК та інших релевантних законів України.",
    "3. Використовуй офіційний юридичний стиль української мови.",
    "4. Формат: шапка (суд, сторони) → вступна частина → описова частина → мотивувальна частина → прохальна частина → додатки.",
    "5. Всі дати записуй у форматі «ДД.ММ.РРРР».",
    ""
  );

  if (promptHint) {
    sections.push(`Додаткові вказівки: ${promptHint}`, "");
  }

  sections.push(
    "=== ВСІ НАДАНІ ДАНІ ===",
    "",
    dumpAllFields(formData),
    "",
    "=== ІНСТРУКЦІЇ ===",
    "",
    "1. Використай ВСІ надані вище дані при складанні документа.",
    "2. Шапка: назва суду (якщо є), дані позивача і відповідача.",
    '3. Заголовок: "ПОЗОВНА ЗАЯВА ..." з відповідною назвою.',
    "4. Описова частина з детальним викладом обставин.",
    "5. Мотивувальна частина з посиланнями на конкретні статті законів.",
    '6. "ПРОШУ:" з конкретними вимогами.',
    '7. "Додатки:" з переліком документів.',
    "8. Дата, підпис.",
    "",
    "НЕ ДОДАВАЙ жодних коментарів чи пояснень — тільки текст документа."
  );

  return sections.join("\n");
}
