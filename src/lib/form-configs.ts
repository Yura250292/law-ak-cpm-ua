/**
 * Dynamic form configurations for each document template.
 * Each template slug maps to specific steps with fields.
 */

export type FieldType = "text" | "date" | "email" | "phone" | "textarea" | "checkbox" | "select" | "currency";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  min?: number;
  /** Show only when another field has a truthy value */
  showWhen?: string;
  options?: { value: string; label: string }[];
  hint?: string;
}

export interface FormStep {
  title: string;
  description: string;
  fields: FormField[];
}

export interface TemplateFormConfig {
  steps: FormStep[];
  /** Fields needed per step for validation */
  stepValidationFields: string[][];
}

// ─────────────────────────────────────────
// ПОЗОВ ПРО РОЗІРВАННЯ ШЛЮБУ
// ─────────────────────────────────────────
const divorceConfig: TemplateFormConfig = {
  steps: [
    {
      title: "Дані сторін",
      description: "Вкажіть повні дані позивача та відповідача",
      fields: [
        // Позивач
        { name: "plaintiff.fullName", label: "ПІБ позивача", type: "text", required: true, placeholder: "Іванов Іван Іванович" },
        { name: "plaintiff.birthDate", label: "Дата народження позивача", type: "date", required: true },
        { name: "plaintiff.ipn", label: "ІПН позивача", type: "text", placeholder: "1234567890", hint: "Індивідуальний податковий номер (10 цифр)" },
        { name: "plaintiff.registrationAddress", label: "Адреса реєстрації позивача", type: "text", required: true, placeholder: "м. Київ, вул. Хрещатик, 1, кв. 1" },
        { name: "plaintiff.phone", label: "Телефон позивача", type: "phone", required: true, placeholder: "+380501234567" },
        // Відповідач
        { name: "defendant.fullName", label: "ПІБ відповідача", type: "text", required: true, placeholder: "Петренко Петро Петрович" },
        { name: "defendant.birthDate", label: "Дата народження відповідача", type: "date" },
        { name: "defendant.registrationAddress", label: "Адреса реєстрації відповідача", type: "text", required: true, placeholder: "м. Київ, вул. Прорізна, 5, кв. 10" },
        { name: "defendant.phone", label: "Телефон відповідача", type: "phone", placeholder: "+380671234567" },
      ],
    },
    {
      title: "Обставини справи",
      description: "Опишіть обставини шлюбу та причини розірвання",
      fields: [
        { name: "marriageDate", label: "Дата реєстрації шлюбу", type: "date", required: true },
        { name: "marriagePlace", label: "Місце реєстрації шлюбу", type: "text", required: true, placeholder: "Відділ РАЦС Шевченківського району м. Києва" },
        { name: "separationDate", label: "Дата фактичного припинення спільного проживання", type: "date", hint: "Якщо вже не проживаєте разом" },
        { name: "hasChildren", label: "Є спільні неповнолітні діти", type: "checkbox" },
        { name: "childrenDetails", label: "Дані дітей (ПІБ, дата народження кожної дитини)", type: "textarea", showWhen: "hasChildren", placeholder: "Іванов Олег Іванович, 01.05.2018 р.н." },
        { name: "childResidence", label: "З ким мають проживати діти", type: "text", showWhen: "hasChildren", placeholder: "З позивачем (матір'ю)" },
        { name: "hasProperty", label: "Є питання поділу майна", type: "checkbox" },
        { name: "propertyDetails", label: "Опис спільного майна", type: "textarea", showWhen: "hasProperty", placeholder: "Квартира за адресою..., автомобіль..." },
        { name: "divorceReason", label: "Причина розірвання шлюбу", type: "textarea", required: true, min: 20, placeholder: "Шлюбні відносини фактично припинилися, спільне господарство не ведеться, примирення неможливе..." },
      ],
    },
    {
      title: "Вимоги та контакти",
      description: "Вкажіть суд, вимоги та контактні дані для отримання документа",
      fields: [
        { name: "courtName", label: "Назва суду", type: "text", required: true, placeholder: "Шевченківський районний суд міста Києва", hint: "Подається за місцем реєстрації відповідача" },
        { name: "additionalDemands", label: "Додаткові вимоги", type: "textarea", placeholder: "Визначити місце проживання дитини з позивачем, стягнути аліменти..." },
        { name: "contactEmail", label: "Email для отримання документа", type: "email", required: true, placeholder: "your@email.com" },
        { name: "contactPhone", label: "Контактний телефон", type: "phone", placeholder: "+380501234567" },
      ],
    },
  ],
  stepValidationFields: [
    ["plaintiff.fullName", "plaintiff.birthDate", "plaintiff.registrationAddress", "plaintiff.phone", "defendant.fullName", "defendant.registrationAddress"],
    ["marriageDate", "marriagePlace", "divorceReason"],
    ["courtName", "contactEmail"],
  ],
};

// ─────────────────────────────────────────
// ПОЗОВ ПРО СТЯГНЕННЯ АЛІМЕНТІВ
// ─────────────────────────────────────────
const alimonyConfig: TemplateFormConfig = {
  steps: [
    {
      title: "Дані сторін",
      description: "Вкажіть дані позивача (того, з ким проживає дитина) та відповідача",
      fields: [
        { name: "plaintiff.fullName", label: "ПІБ позивача", type: "text", required: true, placeholder: "Іванова Марія Петрівна" },
        { name: "plaintiff.birthDate", label: "Дата народження позивача", type: "date", required: true },
        { name: "plaintiff.registrationAddress", label: "Адреса реєстрації позивача", type: "text", required: true, placeholder: "м. Київ, вул. Хрещатик, 1, кв. 1" },
        { name: "plaintiff.phone", label: "Телефон позивача", type: "phone", required: true, placeholder: "+380501234567" },
        { name: "defendant.fullName", label: "ПІБ відповідача (батько/мати дитини)", type: "text", required: true },
        { name: "defendant.birthDate", label: "Дата народження відповідача", type: "date" },
        { name: "defendant.registrationAddress", label: "Адреса реєстрації відповідача", type: "text", required: true },
        { name: "defendant.phone", label: "Телефон відповідача", type: "phone" },
        { name: "defendant.workplace", label: "Місце роботи відповідача", type: "text", placeholder: "ТОВ \"Компанія\", м. Київ", hint: "Якщо відомо" },
        { name: "defendant.position", label: "Посада відповідача", type: "text", placeholder: "Менеджер" },
      ],
    },
    {
      title: "Дані про дитину та обставини",
      description: "Вкажіть інформацію про дитину, на утримання якої стягуються аліменти",
      fields: [
        { name: "childName", label: "ПІБ дитини", type: "text", required: true, placeholder: "Іванов Олег Іванович" },
        { name: "childBirthDate", label: "Дата народження дитини", type: "date", required: true },
        { name: "childBirthCertificate", label: "Серія та номер свідоцтва про народження", type: "text", placeholder: "І-КВ №123456" },
        { name: "marriageDate", label: "Дата реєстрації шлюбу", type: "date", hint: "Якщо були в шлюбі" },
        { name: "divorceDate", label: "Дата розірвання шлюбу", type: "date", hint: "Якщо шлюб розірвано" },
        { name: "childLivesWithPlaintiff", label: "Дитина проживає з позивачем", type: "checkbox" },
        { name: "defendantDoesNotSupport", label: "Відповідач не бере участі у утриманні дитини", type: "checkbox" },
        { name: "childNeeds", label: "Щомісячні витрати на утримання дитини", type: "textarea", required: true, placeholder: "Харчування — 5000 грн, одяг — 2000 грн, навчання — 3000 грн, медицина — 1500 грн..." },
        { name: "defendantIncome", label: "Відомості про доходи відповідача", type: "textarea", placeholder: "Орієнтовний дохід — 30 000 грн/міс (якщо відомо)" },
      ],
    },
    {
      title: "Розмір аліментів та контакти",
      description: "Вкажіть бажаний розмір аліментів і контактні дані",
      fields: [
        { name: "alimentType", label: "Спосіб стягнення аліментів", type: "select", required: true, options: [
          { value: "quarter", label: "1/4 доходу (на 1 дитину)" },
          { value: "third", label: "1/3 доходу (на 2 дітей)" },
          { value: "half", label: "1/2 доходу (на 3+ дітей)" },
          { value: "fixed", label: "Тверда грошова сума" },
        ]},
        { name: "alimentFixedAmount", label: "Розмір аліментів у твердій сумі (грн/міс)", type: "currency", showWhen: "alimentType", placeholder: "5000", hint: "Вкажіть якщо обрали тверду суму" },
        { name: "courtName", label: "Назва суду", type: "text", required: true, placeholder: "Шевченківський районний суд міста Києва" },
        { name: "additionalDemands", label: "Додаткові вимоги", type: "textarea", placeholder: "Стягнути заборгованість по аліментах за попередній період..." },
        { name: "contactEmail", label: "Email для отримання документа", type: "email", required: true, placeholder: "your@email.com" },
        { name: "contactPhone", label: "Контактний телефон", type: "phone" },
      ],
    },
  ],
  stepValidationFields: [
    ["plaintiff.fullName", "plaintiff.birthDate", "plaintiff.registrationAddress", "plaintiff.phone", "defendant.fullName", "defendant.registrationAddress"],
    ["childName", "childBirthDate", "childNeeds"],
    ["alimentType", "courtName", "contactEmail"],
  ],
};

// ─────────────────────────────────────────
// ПОЗОВ ПРО ВІДШКОДУВАННЯ ШКОДИ
// ─────────────────────────────────────────
const damagesConfig: TemplateFormConfig = {
  steps: [
    {
      title: "Дані сторін",
      description: "Вкажіть дані позивача (потерпілого) та відповідача (заподіювача шкоди)",
      fields: [
        { name: "plaintiff.fullName", label: "ПІБ позивача", type: "text", required: true },
        { name: "plaintiff.birthDate", label: "Дата народження позивача", type: "date", required: true },
        { name: "plaintiff.registrationAddress", label: "Адреса реєстрації позивача", type: "text", required: true },
        { name: "plaintiff.phone", label: "Телефон позивача", type: "phone", required: true },
        { name: "defendant.fullName", label: "ПІБ відповідача / Назва юридичної особи", type: "text", required: true },
        { name: "defendant.registrationAddress", label: "Адреса відповідача / Юридична адреса", type: "text", required: true },
        { name: "defendant.edrpou", label: "Код ЄДРПОУ (для юр. осіб)", type: "text", placeholder: "12345678", hint: "Якщо відповідач — юридична особа" },
        { name: "defendant.phone", label: "Телефон відповідача", type: "phone" },
      ],
    },
    {
      title: "Обставини завдання шкоди",
      description: "Детально опишіть інцидент та завдану шкоду",
      fields: [
        { name: "incidentDate", label: "Дата інциденту", type: "date", required: true },
        { name: "incidentPlace", label: "Місце інциденту", type: "text", required: true, placeholder: "м. Київ, вул. Хрещатик, біля будинку №10" },
        { name: "incidentDescription", label: "Детальний опис обставин", type: "textarea", required: true, min: 30, placeholder: "Опишіть що сталося, як і за яких обставин було завдано шкоду..." },
        { name: "damageType", label: "Вид шкоди", type: "select", required: true, options: [
          { value: "material", label: "Матеріальна шкода" },
          { value: "moral", label: "Моральна шкода" },
          { value: "both", label: "Матеріальна та моральна шкода" },
        ]},
        { name: "materialDamageAmount", label: "Сума матеріальної шкоди (грн)", type: "currency", placeholder: "50000", hint: "Вартість пошкодженого майна, витрати на лікування тощо" },
        { name: "materialDamageDetails", label: "Розрахунок матеріальної шкоди", type: "textarea", placeholder: "Ремонт авто — 30 000 грн, медичні витрати — 15 000 грн, втрачений заробіток — 5 000 грн" },
        { name: "moralDamageAmount", label: "Сума моральної шкоди (грн)", type: "currency", placeholder: "20000" },
        { name: "moralDamageJustification", label: "Обґрунтування моральної шкоди", type: "textarea", placeholder: "Фізичний біль, душевні страждання, порушення нормального укладу життя..." },
        { name: "evidence", label: "Наявні докази", type: "textarea", required: true, placeholder: "Медичні довідки, акт про ДТП, фото пошкоджень, показання свідків, чеки на ремонт..." },
      ],
    },
    {
      title: "Вимоги та контакти",
      description: "Вкажіть загальну суму компенсації та контактні дані",
      fields: [
        { name: "totalCompensation", label: "Загальна сума позову (грн)", type: "currency", required: true, placeholder: "70000" },
        { name: "courtName", label: "Назва суду", type: "text", required: true, placeholder: "Шевченківський районний суд міста Києва" },
        { name: "additionalDemands", label: "Додаткові вимоги", type: "textarea", placeholder: "Стягнути судові витрати, витрати на правову допомогу..." },
        { name: "contactEmail", label: "Email для отримання документа", type: "email", required: true, placeholder: "your@email.com" },
        { name: "contactPhone", label: "Контактний телефон", type: "phone" },
      ],
    },
  ],
  stepValidationFields: [
    ["plaintiff.fullName", "plaintiff.birthDate", "plaintiff.registrationAddress", "plaintiff.phone", "defendant.fullName", "defendant.registrationAddress"],
    ["incidentDate", "incidentPlace", "incidentDescription", "damageType", "evidence"],
    ["totalCompensation", "courtName", "contactEmail"],
  ],
};

// ─────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────
const formConfigs: Record<string, TemplateFormConfig> = {
  "pozov-pro-rozirvannnya-shlyubu": divorceConfig,
  "pozov-pro-stygnennya-alimentiv": alimonyConfig,
  "pozov-pro-vidshkoduvannya-shkody": damagesConfig,
};

/** Default fallback config (divorce-like) */
const defaultConfig = divorceConfig;

export function getFormConfig(templateSlug: string): TemplateFormConfig {
  return formConfigs[templateSlug] ?? defaultConfig;
}

export function getDefaultValues(config: TemplateFormConfig): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  for (const step of config.steps) {
    for (const field of step.fields) {
      const parts = field.name.split(".");
      if (parts.length === 2) {
        const [group, key] = parts;
        if (!defaults[group] || typeof defaults[group] !== "object") {
          defaults[group] = {};
        }
        (defaults[group] as Record<string, unknown>)[key] = field.type === "checkbox" ? false : "";
      } else {
        defaults[field.name] = field.type === "checkbox" ? false : "";
      }
    }
  }

  return defaults;
}
