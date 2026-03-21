/**
 * Build a detailed, template-specific prompt for Ukrainian legal document generation.
 * The AI acts as a professional lawyer assistant — generating accurate, court-ready documents.
 */

const SYSTEM_ROLE = `Ти — професійний AI-помічник адвоката в Україні. Твоя роль — допомагати адвокату у підготовці процесуальних документів найвищої якості.

КЛЮЧОВІ ПРИНЦИПИ:
1. ТОЧНІСТЬ ПОСИЛАНЬ: Посилайся ТІЛЬКИ на реально існуючі статті чинного законодавства України. Якщо не впевнений у номері статті — краще вказати лише назву закону без конкретного номера статті, ніж вигадати неіснуючу.
2. АКТУАЛЬНІСТЬ: Використовуй законодавство чинне станом на 2024-2025 рр. Враховуй зміни, внесені в ЦПК, СК, ЦК за останні роки.
3. ПРОФЕСІЙНІСТЬ: Документ має бути готовим до подання в суд після мінімальної перевірки адвокатом.
4. СТРУКТУРОВАНІСТЬ: Чітка логічна структура, послідовний виклад, коректне оформлення.
5. ЮРИДИЧНА МОВА: Офіційний юридичний стиль української мови. Без розмовних зворотів.

БАЗОВІ НОРМАТИВНІ АКТИ (використовуй ЛИШЕ ці та їх реальні статті):
- Цивільний процесуальний кодекс України (ЦПК) — процесуальні вимоги
- Сімейний кодекс України (СК) — сімейні правовідносини
- Цивільний кодекс України (ЦК) — цивільні правовідносини
- Конституція України — базові права
- Закон України "Про судовий збір"
- Закон України "Про виконавче провадження"

СУВОРО ЗАБОРОНЕНО:
- Вигадувати номери статей, постанов чи рішень судів
- Посилатися на скасовані або неіснуючі нормативні акти
- Вказувати конкретні номери справ Верховного Суду без впевненості в їх існуванні
- Додавати коментарі, пояснення чи примітки — тільки текст документа`;

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

function getField(formData: Record<string, any>, path: string): string {
  if (formData[path] !== undefined && formData[path] !== null && formData[path] !== "") {
    return String(formData[path]);
  }
  const parts = path.split(".");
  let current: any = formData;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return "";
    current = current[part];
  }
  if (current === undefined || current === null || current === "") return "";
  return String(current);
}

function line(label: string, formData: Record<string, any>, path: string): string {
  const val = getField(formData, path);
  return val ? `- ${label}: ${val}` : "";
}

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
    SYSTEM_ROLE,
    "",
    "═══════════════════════════════════════════════",
    "ЗАВДАННЯ: Склади ПОЗОВНУ ЗАЯВУ ПРО РОЗІРВАННЯ ШЛЮБУ",
    "═══════════════════════════════════════════════",
    "",
    "ПРАВОВА БАЗА (використовуй ТІЛЬКИ ці реальні статті):",
    "- ст. 21 СК — поняття шлюбу",
    "- ст. 105 СК — підстави припинення шлюбу",
    "- ст. 106 СК — розірвання шлюбу за заявою подружжя (РАЦС)",
    "- ст. 107 СК — розірвання шлюбу за заявою одного з подружжя (РАЦС)",
    "- ст. 109 СК — розірвання шлюбу судом за позовом",
    "- ст. 110 СК — право на пред'явлення позову про розірвання шлюбу",
    "- ст. 112 СК — підстави розірвання шлюбу судом",
    "- ст. 160 СК — право батьків на визначення місця проживання дитини",
    "- ст. 175 ЦПК — вимоги до позовної заяви",
    "- ст. 187 ЦПК — порядок подання позовної заяви",
    ""
  );

  if (promptHint) {
    sections.push(`Додаткові вказівки від адвоката: ${promptHint}`, "");
  }

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

  sections.push(
    "ВИМОГИ:",
    ...[
      line("Назва суду", formData, "courtName"),
      line("Додаткові вимоги", formData, "additionalDemands"),
    ].filter(Boolean),
    ""
  );

  sections.push(
    "ОБОВ'ЯЗКОВА СТРУКТУРА ДОКУМЕНТА:",
    '1. ШАПКА: "До [назва суду]", потім повні дані позивача (ПІБ, ІПН, адреса, тел.) та відповідача.',
    '2. ЗАГОЛОВОК: "ПОЗОВНА ЗАЯВА" та підзаголовок "про розірвання шлюбу".',
    "3. ВСТУПНА ЧАСТИНА: Коли і де зареєстровано шлюб, номер актового запису (якщо є).",
    "4. ОПИСОВА ЧАСТИНА: Коли припинилося спільне проживання, причини розпаду, інформація про дітей та майно.",
    "5. МОТИВУВАЛЬНА ЧАСТИНА: Посилання на конкретні статті СК та ЦПК (ЛИШЕ з переліку вище). Логічне обґрунтування.",
    '6. ПРОХАЛЬНА ЧАСТИНА: "ПРОШУ:" з пронумерованими вимогами (розірвати шлюб, визначити місце проживання дітей тощо).',
    '7. ДОДАТКИ: "Додатки:" — пронумерований перелік (копія позовної заяви, свідоцтво про шлюб, свідоцтва про народження, квитанція судового збору).',
    '8. Дата та "Підпис __________ [ПІБ позивача]".',
    "",
    "ВИДАЙ ТІЛЬКИ ГОТОВИЙ ТЕКСТ ДОКУМЕНТА. БЕЗ КОМЕНТАРІВ, ПОЯСНЕНЬ ЧИ ПРИМІТОК."
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
    SYSTEM_ROLE,
    "",
    "═══════════════════════════════════════════════",
    "ЗАВДАННЯ: Склади ПОЗОВНУ ЗАЯВУ ПРО СТЯГНЕННЯ АЛІМЕНТІВ НА УТРИМАННЯ ДИТИНИ",
    "═══════════════════════════════════════════════",
    "",
    "ПРАВОВА БАЗА (використовуй ТІЛЬКИ ці реальні статті):",
    "- ст. 51 Конституції України — захист сім'ї, материнства, батьківства і дитинства",
    "- ст. 180 СК — обов'язок батьків утримувати дитину",
    "- ст. 181 СК — способи виконання обов'язку щодо утримання",
    "- ст. 182 СК — обов'язок батьків утримувати дитину — мінімальний розмір",
    "- ст. 183 СК — обов'язок батьків утримувати повнолітніх дочку, сина",
    "- ст. 184 СК — участь батьків у додаткових витратах на дитину",
    "- ст. 185 СК — участь того з батьків, хто проживає окремо, у витратах",
    "- ст. 187 СК — особи, які мають право звернутися до суду з позовом про стягнення аліментів",
    "- ст. 189 СК — договір між батьками про сплату аліментів",
    "- ст. 194 СК — стягнення аліментів за рішенням суду",
    "- ст. 195 СК — визначення розміру аліментів у частці від заробітку",
    "- ст. 198 СК — стягнення аліментів за минулий час",
    "- ст. 175 ЦПК — вимоги до позовної заяви",
    "- Мінімальний розмір аліментів: 50% прожиткового мінімуму для дитини відповідного віку (ст. 182 СК)",
    ""
  );

  if (promptHint) {
    sections.push(`Додаткові вказівки від адвоката: ${promptHint}`, "");
  }

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

  sections.push(
    "ДАНІ ПРО ДИТИНУ:",
    ...[
      line("ПІБ дитини", formData, "childName"),
      line("Дата народження дитини", formData, "childBirthDate"),
      line("Свідоцтво про народження", formData, "childBirthCertificate"),
    ].filter(Boolean),
    ""
  );

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

  const alimentType = getField(formData, "alimentType");
  const alimentLabels: Record<string, string> = {
    quarter: "1/4 частину всіх доходів відповідача (на 1 дитину, ст. 195 СК)",
    third: "1/3 частину всіх доходів відповідача (на 2 дітей, ст. 195 СК)",
    half: "1/2 частину всіх доходів відповідача (на 3+ дітей, ст. 195 СК)",
    fixed: "тверду грошову суму (ст. 184 СК)",
  };

  sections.push(
    "РОЗМІР АЛІМЕНТІВ:",
    `- Спосіб стягнення: ${alimentLabels[alimentType] ?? alimentType}`,
    ...[
      line("Сума у твердій грошовій сумі (грн/міс)", formData, "alimentFixedAmount"),
    ].filter(Boolean),
    ""
  );

  sections.push(
    "ВИМОГИ:",
    ...[
      line("Назва суду", formData, "courtName"),
      line("Додаткові вимоги", formData, "additionalDemands"),
    ].filter(Boolean),
    ""
  );

  sections.push(
    "ОБОВ'ЯЗКОВА СТРУКТУРА ДОКУМЕНТА:",
    '1. ШАПКА: "До [назва суду]", дані позивача і відповідача.',
    '2. ЗАГОЛОВОК: "ПОЗОВНА ЗАЯВА" та підзаголовок "про стягнення аліментів на утримання дитини".',
    "3. ВСТУПНА ЧАСТИНА: Хто є батьками дитини, коли народилася дитина.",
    "4. ОПИСОВА ЧАСТИНА: З ким проживає дитина, чи бере відповідач участь у утриманні, конкретні витрати.",
    "5. МОТИВУВАЛЬНА ЧАСТИНА: Посилання на статті СК (ЛИШЕ з переліку вище). Розрахунок аліментів з урахуванням прожиткового мінімуму.",
    '6. ПРОХАЛЬНА ЧАСТИНА: "ПРОШУ:" — стягнути аліменти у конкретному розмірі, вказати з якого моменту.',
    '7. ДОДАТКИ: пронумерований перелік (свідоцтво про народження, довідки про доходи, підтвердження витрат).',
    '8. Дата та "Підпис __________ [ПІБ позивача]".',
    "",
    "ВИДАЙ ТІЛЬКИ ГОТОВИЙ ТЕКСТ ДОКУМЕНТА. БЕЗ КОМЕНТАРІВ, ПОЯСНЕНЬ ЧИ ПРИМІТОК."
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
    SYSTEM_ROLE,
    "",
    "═══════════════════════════════════════════════",
    "ЗАВДАННЯ: Склади ПОЗОВНУ ЗАЯВУ ПРО ВІДШКОДУВАННЯ ШКОДИ",
    "═══════════════════════════════════════════════",
    "",
    "ПРАВОВА БАЗА (використовуй ТІЛЬКИ ці реальні статті):",
    "- ст. 3 Конституції України — людина, її життя, здоров'я як найвища соціальна цінність",
    "- ст. 16 ЦК — захист цивільних прав та інтересів судом",
    "- ст. 22 ЦК — відшкодування збитків та інші способи відшкодування",
    "- ст. 23 ЦК — відшкодування моральної шкоди",
    "- ст. 1166 ЦК — загальні підстави відповідальності за завдану майнову шкоду",
    "- ст. 1167 ЦК — підстави відповідальності за завдану моральну шкоду",
    "- ст. 1168 ЦК — відшкодування моральної шкоди",
    "- ст. 1169 ЦК — обов'язок роботодавця відшкодувати шкоду",
    "- ст. 1172 ЦК — відшкодування шкоди, завданої працівником",
    "- ст. 175 ЦПК — вимоги до позовної заяви",
    "- Постанова Пленуму ВСУ №4 від 31.03.1995 «Про судову практику в справах про відшкодування моральної (немайнової) шкоди» (УВАГА: посилайся тільки на цю постанову, якщо заявлено моральну шкоду)",
    ""
  );

  if (promptHint) {
    sections.push(`Додаткові вказівки від адвоката: ${promptHint}`, "");
  }

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

  sections.push(
    "ОБСТАВИНИ ЗАВДАННЯ ШКОДИ:",
    ...[
      line("Дата інциденту", formData, "incidentDate"),
      line("Місце інциденту", formData, "incidentPlace"),
      line("Опис обставин", formData, "incidentDescription"),
    ].filter(Boolean),
    ""
  );

  const damageType = getField(formData, "damageType");
  const damageLabels: Record<string, string> = {
    material: "Матеріальна шкода (ст. 1166 ЦК)",
    moral: "Моральна шкода (ст. 1167, 1168 ЦК)",
    both: "Матеріальна та моральна шкода (ст. 1166-1168 ЦК)",
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

  sections.push(
    "ДОКАЗИ:",
    ...[line("Наявні докази", formData, "evidence")].filter(Boolean),
    ""
  );

  sections.push(
    "ВИМОГИ:",
    ...[
      line("Назва суду", formData, "courtName"),
      line("Додаткові вимоги", formData, "additionalDemands"),
    ].filter(Boolean),
    ""
  );

  sections.push(
    "ОБОВ'ЯЗКОВА СТРУКТУРА ДОКУМЕНТА:",
    '1. ШАПКА: "До [назва суду]", дані позивача і відповідача.',
    '2. ЗАГОЛОВОК: "ПОЗОВНА ЗАЯВА" та підзаголовок "про відшкодування матеріальної (та/або моральної) шкоди".',
    "3. ВСТУПНА ЧАСТИНА: Стислий опис суті спору.",
    "4. ОПИСОВА ЧАСТИНА: Детальний виклад обставин інциденту, причинно-наслідковий зв'язок між діями відповідача і шкодою.",
    "5. МОТИВУВАЛЬНА ЧАСТИНА: Посилання на статті ЦК (ЛИШЕ з переліку вище). Детальний розрахунок шкоди з обґрунтуванням кожної суми.",
    '6. ПРОХАЛЬНА ЧАСТИНА: "ПРОШУ:" — стягнути конкретні суми з розбивкою (матеріальна + моральна окремо).',
    '7. ДОДАТКИ: пронумерований перелік доказів (медичні довідки, акти, фото, чеки, висновки експертів, показання свідків).',
    '8. Дата та "Підпис __________ [ПІБ позивача]".',
    "",
    "ВИДАЙ ТІЛЬКИ ГОТОВИЙ ТЕКСТ ДОКУМЕНТА. БЕЗ КОМЕНТАРІВ, ПОЯСНЕНЬ ЧИ ПРИМІТОК."
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
    SYSTEM_ROLE,
    "",
    "═══════════════════════════════════════════════",
    `ЗАВДАННЯ: Склади юридичний документ: "${templateTitle}"`,
    "═══════════════════════════════════════════════",
    "",
    "ПРАВОВА БАЗА:",
    "- Цивільний процесуальний кодекс України (ЦПК) — процесуальні вимоги",
    "- Посилайся ТІЛЬКИ на реально існуючі статті відповідних кодексів та законів",
    "- Якщо не впевнений у номері статті — вказуй лише назву закону",
    ""
  );

  if (promptHint) {
    sections.push(`Додаткові вказівки від адвоката: ${promptHint}`, "");
  }

  sections.push(
    "=== ВСІ НАДАНІ ДАНІ ===",
    "",
    dumpAllFields(formData),
    "",
    "=== ІНСТРУКЦІЇ ===",
    "",
    "1. Використай ВСІ надані вище дані при складанні документа.",
    "2. Шапка: назва суду (якщо є), дані позивача і відповідача з повними адресами та контактами.",
    '3. Заголовок: "ПОЗОВНА ЗАЯВА" з відповідним підзаголовком.',
    "4. Описова частина з детальним викладом обставин.",
    "5. Мотивувальна частина з посиланнями ЛИШЕ на реально існуючі статті законів.",
    '6. "ПРОШУ:" з пронумерованими конкретними вимогами.',
    '7. "Додатки:" з пронумерованим переліком документів.',
    '8. Дата та "Підпис __________ [ПІБ позивача]".',
    "9. Всі дати у форматі «ДД.ММ.РРРР».",
    "",
    "ВИДАЙ ТІЛЬКИ ГОТОВИЙ ТЕКСТ ДОКУМЕНТА. БЕЗ КОМЕНТАРІВ, ПОЯСНЕНЬ ЧИ ПРИМІТОК."
  );

  return sections.join("\n");
}
