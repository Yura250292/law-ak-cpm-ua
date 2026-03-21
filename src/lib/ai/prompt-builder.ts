/**
 * Build a detailed, template-specific prompt for Ukrainian legal document generation.
 * The AI acts as a professional lawyer assistant — generating accurate, court-ready documents
 * with separate verified legal sources for the lawyer's review.
 */

const SYSTEM_ROLE = `Ти — професійний AI-помічник адвоката в Україні. Твоя роль — допомагати адвокату у підготовці процесуальних документів найвищої якості.

═══ ТВОЯ РОЛЬ ═══

Ти НЕ заміняєш адвоката. Ти — його кваліфікований помічник, який:
- Готує чорновий текст документа на основі даних клієнта
- Підбирає релевантні норми законодавства
- Формує правову позицію для перевірки адвокатом
- Надає джерела та посилання для верифікації адвокатом

═══ КРИТИЧНІ ПРАВИЛА ТОЧНОСТІ ═══

1. ПОСИЛАННЯ НА ЗАКОНИ:
   - Посилайся ТІЛЬКИ на реально існуючі статті чинного законодавства України
   - Якщо не впевнений у номері статті — НЕ ВКАЗУЙ його. Краще написати "відповідно до Сімейного кодексу України" ніж вказати неправильну статтю
   - Ніколи не вигадуй номери статей, частин, пунктів
   - Ніколи не вигадуй назви постанов, рішень судів

2. СУДОВА ПРАКТИКА:
   - НЕ посилайся на конкретні номери судових справ, якщо ти не на 100% впевнений у їх існуванні
   - Можеш згадувати загальні правові позиції Верховного Суду без конкретних номерів
   - Можеш посилатись на Постанови Пленуму ВСУ, які ти точно знаєш (дата + номер)

3. АКТУАЛЬНІСТЬ:
   - Використовуй законодавство чинне станом на 2024-2025 рр.
   - Враховуй, що ЦПК України діє в редакції від 2017 року (з наступними змінами)
   - СК України діє з 2004 року (з наступними змінами)

4. САМОПЕРЕВІРКА перед видачею:
   - Чи кожне посилання на статтю є реальним?
   - Чи стаття стосується саме цього питання?
   - Чи правильно вказані частини та пункти статей?
   - Якщо є сумніви — прибери конкретний номер

═══ ФОРМАТ ВІДПОВІДІ ═══

Твоя відповідь ОБОВ'ЯЗКОВО складається з ДВОХ частин, розділених маркером:

ЧАСТИНА 1: Текст документа (все до маркера)
ЧАСТИНА 2: Джерела та правовий аналіз (все після маркера)

Маркер розділення: ===ДЖЕРЕЛА===

ЧАСТИНА 2 (після ===ДЖЕРЕЛА===) має містити:

А) ВИКОРИСТАНІ НОРМАТИВНІ АКТИ:
   Перелік усіх законів та статей, на які посилається документ, з коротким описом що саме регулює кожна стаття.

Б) ПРАВОВИЙ АНАЛІЗ ДЛЯ АДВОКАТА:
   - Сильні сторони правової позиції
   - Можливі ризики та слабкі місця
   - На що звернути увагу
   - Які додаткові докази можуть підсилити позицію

В) РЕКОМЕНДАЦІЇ АДВОКАТУ:
   - Що варто перевірити або уточнити у клієнта
   - Які документи додатково запросити
   - Тактичні рекомендації

Г) ЗАСТЕРЕЖЕННЯ:
   - Які посилання потребують додаткової верифікації адвокатом
   - Де AI міг допустити неточність

ВАЖЛИВО: Частина 2 (джерела) — ТІЛЬКИ для адвоката, клієнт її НЕ бачить, в PDF вона НЕ потрапляє.`;

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

const VERIFIED_LAWS = `
ПЕРЕВІРЕНІ НОРМАТИВНІ АКТИ (посилайся ПЕРЕВАЖНО на ці):

КОНСТИТУЦІЯ УКРАЇНИ:
- ст. 3 — людина, її життя і здоров'я як найвища соціальна цінність
- ст. 21 — рівність прав і свобод
- ст. 51 — захист сім'ї, материнства, батьківства і дитинства
- ст. 55 — право на судовий захист

ЦИВІЛЬНИЙ ПРОЦЕСУАЛЬНИЙ КОДЕКС УКРАЇНИ (ЦПК):
- ст. 2 — завдання та основні засади цивільного судочинства
- ст. 4 — право на звернення до суду
- ст. 12 — диспозитивність цивільного судочинства
- ст. 19 — юрисдикція судів
- ст. 27 — предметна юрисдикція
- ст. 175 — форма і зміст позовної заяви
- ст. 176 — ціна позову
- ст. 177 — документи, що додаються до позовної заяви
- ст. 185 — залишення позовної заяви без руху
- ст. 187 — відкриття провадження у справі
- ст. 274 — спрощене позовне провадження

ЗАКОН УКРАЇНИ "ПРО СУДОВИЙ ЗБІР":
- ст. 3 — розмір судового збору
- ст. 4 — пільги щодо сплати судового збору
- ст. 5 — звільнення від сплати судового збору`;

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
    VERIFIED_LAWS,
    "",
    "СІМЕЙНИЙ КОДЕКС УКРАЇНИ (СК):",
    "- ст. 21 — поняття шлюбу",
    "- ст. 105 — підстави припинення шлюбу",
    "- ст. 106 — розірвання шлюбу органом РАЦС за заявою подружжя, яке не має дітей",
    "- ст. 107 — розірвання шлюбу органом РАЦС за заявою одного з подружжя",
    "- ст. 109 — розірвання шлюбу за рішенням суду",
    "- ст. 110 — право на пред'явлення позову про розірвання шлюбу",
    "- ст. 112 — підстави для розірвання шлюбу судом",
    "- ст. 160 — право батьків на визначення місця проживання дитини",
    "- ст. 161 — спір між матір'ю та батьком щодо місця проживання дитини",
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
    "",
    "ДАНІ ВІДПОВІДАЧА:",
    ...[
      line("ПІБ", formData, "defendant.fullName"),
      line("Дата народження", formData, "defendant.birthDate"),
      line("Адреса реєстрації", formData, "defendant.registrationAddress"),
      line("Фактична адреса", formData, "defendant.actualAddress"),
      line("Телефон", formData, "defendant.phone"),
    ].filter(Boolean),
    "",
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
    "",
    "ВИМОГИ:",
    ...[
      line("Назва суду", formData, "courtName"),
      line("Додаткові вимоги", formData, "additionalDemands"),
    ].filter(Boolean),
    ""
  );

  sections.push(DOCUMENT_STRUCTURE_INSTRUCTIONS);
  sections.push(SOURCES_SECTION_INSTRUCTIONS);

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
    VERIFIED_LAWS,
    "",
    "СІМЕЙНИЙ КОДЕКС УКРАЇНИ (СК):",
    "- ст. 180 — обов'язок батьків утримувати дитину до досягнення нею повноліття",
    "- ст. 181 — способи виконання батьками обов'язку утримувати дитину",
    "- ст. 182 — мінімальний розмір аліментів на дитину (50% прожиткового мінімуму)",
    "- ст. 183 — обов'язок батьків утримувати повнолітніх дочку, сина, які продовжують навчання",
    "- ст. 184 — участь батьків у додаткових витратах на дитину",
    "- ст. 185 — участь того з батьків, хто проживає окремо від дитини, у витратах на дитину",
    "- ст. 187 — особи, які мають право звернутися до суду з позовом про стягнення аліментів",
    "- ст. 189 — договір батьків про сплату аліментів на дитину",
    "- ст. 194 — стягнення аліментів за рішенням суду",
    "- ст. 195 — визначення розміру аліментів у частці від заробітку (доходу) матері, батька",
    "- ст. 198 — стягнення аліментів за минулий час та заборгованості за аліментами",
    "",
    "УВАГА: Мінімальний розмір аліментів — 50% прожиткового мінімуму для дитини відповідного віку (ч. 2 ст. 182 СК).",
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
    "",
    "ДАНІ ВІДПОВІДАЧА (батько/мати, який не утримує дитину):",
    ...[
      line("ПІБ", formData, "defendant.fullName"),
      line("Дата народження", formData, "defendant.birthDate"),
      line("Адреса реєстрації", formData, "defendant.registrationAddress"),
      line("Телефон", formData, "defendant.phone"),
      line("Місце роботи", formData, "defendant.workplace"),
      line("Посада", formData, "defendant.position"),
    ].filter(Boolean),
    "",
    "ДАНІ ПРО ДИТИНУ:",
    ...[
      line("ПІБ дитини", formData, "childName"),
      line("Дата народження дитини", formData, "childBirthDate"),
      line("Свідоцтво про народження", formData, "childBirthCertificate"),
    ].filter(Boolean),
    "",
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
    ...[line("Сума у твердій грошовій сумі (грн/міс)", formData, "alimentFixedAmount")].filter(Boolean),
    "",
    "ВИМОГИ:",
    ...[
      line("Назва суду", formData, "courtName"),
      line("Додаткові вимоги", formData, "additionalDemands"),
    ].filter(Boolean),
    ""
  );

  sections.push(DOCUMENT_STRUCTURE_INSTRUCTIONS);
  sections.push(SOURCES_SECTION_INSTRUCTIONS);

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
    VERIFIED_LAWS,
    "",
    "ЦИВІЛЬНИЙ КОДЕКС УКРАЇНИ (ЦК):",
    "- ст. 16 — захист цивільних прав та інтересів судом",
    "- ст. 22 — відшкодування збитків та інші способи відшкодування майнової шкоди",
    "- ст. 23 — відшкодування моральної шкоди",
    "- ст. 1166 — загальні підстави відповідальності за завдану майнову шкоду",
    "- ст. 1167 — підстави відповідальності за завдану моральну шкоду",
    "- ст. 1168 — відшкодування моральної шкоди",
    "- ст. 1172 — відшкодування юридичною або фізичною особою шкоди, завданої їхнім працівником",
    "- ст. 1187 — відшкодування шкоди, завданої джерелом підвищеної небезпеки",
    "",
    "Постанова Пленуму Верховного Суду України №4 від 31.03.1995 «Про судову практику в справах про відшкодування моральної (немайнової) шкоди» — посилатись ТІЛЬКИ якщо заявлено моральну шкоду.",
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
    "",
    "ДАНІ ВІДПОВІДАЧА (заподіювач шкоди):",
    ...[
      line("ПІБ / Назва юридичної особи", formData, "defendant.fullName"),
      line("Адреса / Юридична адреса", formData, "defendant.registrationAddress"),
      line("Код ЄДРПОУ", formData, "defendant.edrpou"),
      line("Телефон", formData, "defendant.phone"),
    ].filter(Boolean),
    "",
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
    "",
    "ДОКАЗИ:",
    ...[line("Наявні докази", formData, "evidence")].filter(Boolean),
    "",
    "ВИМОГИ:",
    ...[
      line("Назва суду", formData, "courtName"),
      line("Додаткові вимоги", formData, "additionalDemands"),
    ].filter(Boolean),
    ""
  );

  sections.push(DOCUMENT_STRUCTURE_INSTRUCTIONS);
  sections.push(SOURCES_SECTION_INSTRUCTIONS);

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
    VERIFIED_LAWS,
    "",
    "Посилайся ТІЛЬКИ на реально існуючі статті відповідних кодексів та законів.",
    "Якщо не впевнений у номері статті — вказуй лише назву закону.",
    ""
  );

  if (promptHint) {
    sections.push(`Додаткові вказівки від адвоката: ${promptHint}`, "");
  }

  sections.push(
    "=== ВСІ НАДАНІ ДАНІ ===",
    "",
    dumpAllFields(formData),
    ""
  );

  sections.push(DOCUMENT_STRUCTURE_INSTRUCTIONS);
  sections.push(SOURCES_SECTION_INSTRUCTIONS);

  return sections.join("\n");
}

// ─── Shared instruction blocks ─────────────────────────

const DOCUMENT_STRUCTURE_INSTRUCTIONS = `
ОБОВ'ЯЗКОВА СТРУКТУРА ДОКУМЕНТА (ЧАСТИНА 1, до маркера ===ДЖЕРЕЛА===):

1. ШАПКА (правий верхній кут):
   "До [повна назва суду]"
   Позивач: [ПІБ повністю, ІПН, адреса, тел.]
   Відповідач: [ПІБ повністю, адреса, тел.]

2. ЗАГОЛОВОК (по центру):
   "ПОЗОВНА ЗАЯВА"
   "про [суть позову]"

3. ВСТУПНА ЧАСТИНА:
   Коротке введення в суть справи.

4. ОПИСОВА ЧАСТИНА:
   Детальний виклад обставин справи в хронологічному порядку.

5. МОТИВУВАЛЬНА (ПРАВОВА) ЧАСТИНА:
   "Правові підстави позову"
   Посилання на конкретні статті з переліку ПЕРЕВІРЕНИХ нормативних актів вище.
   Логічне обґрунтування кожної вимоги.

6. ПРОХАЛЬНА ЧАСТИНА:
   "ПРОШУ:"
   Пронумеровані конкретні вимоги.

7. ДОДАТКИ:
   "Додатки:"
   Пронумерований перелік документів.

8. ЗАВЕРШЕННЯ:
   Дата: "«___» __________ 20__ р."
   Підпис: "__________ [ПІБ позивача]"

Всі дати у форматі «ДД.ММ.РРРР».
НЕ додавай коментарів чи пояснень у текст документа — тільки сам юридичний документ.`;

const SOURCES_SECTION_INSTRUCTIONS = `

ПІСЛЯ тексту документа ОБОВ'ЯЗКОВО додай маркер та джерела:

===ДЖЕРЕЛА===

А) ВИКОРИСТАНІ НОРМАТИВНІ АКТИ:
Перелічи ВСІ статті законів, на які посилається документ. Для кожної вкажи:
- Повну назву нормативного акту
- Номер статті, частини, пункту
- Що саме регулює ця норма (1 речення)
- Наскільки ти впевнений у точності посилання (Висока/Середня/Потребує перевірки)

Б) ПРАВОВИЙ АНАЛІЗ ДЛЯ АДВОКАТА:
- Сильні сторони позиції клієнта
- Потенційні ризики та контраргументи відповідача
- Рекомендовані додаткові докази
- Процесуальні особливості (юрисдикція, судовий збір, строки)

В) РЕКОМЕНДАЦІЇ:
- Що уточнити у клієнта
- Які документи додатково запросити
- Тактичні поради щодо ведення справи

Г) ЗАСТЕРЕЖЕННЯ ЩОДО ТОЧНОСТІ:
- Вкажи, які посилання ти вважаєш 100% точними
- Вкажи, які посилання адвокат має перевірити додатково
- Чи є моменти, де ти не впевнений у правильності правової позиції`;

/**
 * Parse AI response into document text and legal sources.
 * Returns { documentText, legalSources }
 */
export function parseAiResponse(fullText: string): {
  documentText: string;
  legalSources: string;
} {
  const separator = "===ДЖЕРЕЛА===";
  const index = fullText.indexOf(separator);

  if (index === -1) {
    // No separator found — treat everything as document text
    return {
      documentText: fullText.trim(),
      legalSources: "",
    };
  }

  return {
    documentText: fullText.substring(0, index).trim(),
    legalSources: fullText.substring(index + separator.length).trim(),
  };
}
