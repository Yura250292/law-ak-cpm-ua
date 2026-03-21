/**
 * Test data for quick form filling during development.
 * Remove this file before production release.
 */

const divorceTestData: Record<string, unknown> = {
  plaintiff: {
    fullName: "Коваленко Марія Олександрівна",
    birthDate: "1990-05-15",
    ipn: "2987654321",
    registrationAddress: "м. Київ, вул. Хрещатик, 22, кв. 15",
    phone: "+380501234567",
  },
  defendant: {
    fullName: "Коваленко Андрій Сергійович",
    birthDate: "1988-11-20",
    registrationAddress: "м. Київ, вул. Саксаганського, 44, кв. 8",
    phone: "+380671112233",
  },
  marriageDate: "2015-06-12",
  marriagePlace: "Відділ РАЦС Шевченківського району м. Києва",
  separationDate: "2025-09-01",
  hasChildren: true,
  childrenDetails: "Коваленко Софія Андріївна, 10.03.2018 р.н.",
  childResidence: "З позивачем (матір'ю)",
  hasProperty: false,
  propertyDetails: "",
  divorceReason: "Шлюбні відносини фактично припинилися у вересні 2025 року. Спільне господарство не ведеться, сімейні стосунки не підтримуються. Відповідач залишив сімейне житло та проживає окремо. Примирення неможливе.",
  courtName: "Шевченківський районний суд міста Києва",
  additionalDemands: "Визначити місце проживання дитини Коваленко Софії Андріївни з позивачем",
  contactEmail: "test@example.com",
  contactPhone: "+380501234567",
};

const alimonyTestData: Record<string, unknown> = {
  plaintiff: {
    fullName: "Петренко Ольга Василівна",
    birthDate: "1992-03-28",
    registrationAddress: "м. Одеса, вул. Дерибасівська, 10, кв. 3",
    phone: "+380931112233",
  },
  defendant: {
    fullName: "Петренко Ігор Миколайович",
    birthDate: "1989-07-14",
    registrationAddress: "м. Одеса, пр. Шевченка, 55, кв. 12",
    phone: "+380501234567",
    workplace: 'ТОВ "Морські технології", м. Одеса',
    position: "Інженер-програміст",
  },
  childName: "Петренко Максим Ігорович",
  childBirthDate: "2019-02-14",
  childBirthCertificate: "І-ОД №456789",
  marriageDate: "2017-08-20",
  divorceDate: "2024-05-15",
  childLivesWithPlaintiff: true,
  defendantDoesNotSupport: true,
  childNeeds: "Харчування — 6000 грн, одяг та взуття — 2500 грн, навчання та розвиток — 3000 грн, медичні витрати — 1500 грн, комунальні (частка дитини) — 1000 грн. Загалом — 14 000 грн/міс",
  defendantIncome: 'Орієнтовний дохід — 45 000 грн/міс (зарплата інженера-програміста у ТОВ "Морські технології")',
  alimentType: "quarter",
  alimentFixedAmount: "",
  courtName: "Приморський районний суд міста Одеси",
  additionalDemands: "Стягнути заборгованість по аліментах з 15.05.2024",
  contactEmail: "test@example.com",
  contactPhone: "+380931112233",
};

const damagesTestData: Record<string, unknown> = {
  plaintiff: {
    fullName: "Шевченко Дмитро Олегович",
    birthDate: "1985-12-03",
    registrationAddress: "м. Львів, вул. Франка, 18, кв. 7",
    phone: "+380971234567",
  },
  defendant: {
    fullName: 'ТОВ "БудМонтаж Плюс"',
    registrationAddress: "м. Львів, вул. Промислова, 22, офіс 5",
    edrpou: "43215678",
    phone: "",
  },
  incidentDate: "2025-11-15",
  incidentPlace: "м. Львів, вул. Франка, 18, біля під'їзду №2",
  incidentDescription: 'З даху будинку під час ремонтних робіт ТОВ "БудМонтаж Плюс" впала будівельна конструкція, яка пошкодила автомобіль позивача Toyota Camry (д.н.з. ВС 4567 АК). Автомобіль отримав значні пошкодження: вм\'ятина даху, розбите лобове та заднє скло, пошкодження капоту. Позивач отримав тілесні ушкодження легкого ступеню (забій правого плеча).',
  damageType: "both",
  materialDamageAmount: "185000",
  materialDamageDetails: "Ремонт кузова авто — 95 000 грн, заміна лобового скла — 25 000 грн, заміна заднього скла — 18 000 грн, фарбування — 32 000 грн, медичні витрати — 8 000 грн, евакуатор — 2 000 грн, оренда авто — 5 000 грн",
  moralDamageAmount: "50000",
  moralDamageJustification: "Фізичний біль від травми плеча, душевні страждання від пошкодження майна, позбавлення можливості користуватися транспортним засобом протягом 3 тижнів.",
  evidence: "1. Акт огляду ТЗ від 15.11.2025\n2. Висновок СТО про вартість ремонту\n3. Медична довідка\n4. Фотографії з місця події (12 шт.)\n5. Показання свідків\n6. Чеки на оплату",
  totalCompensation: "235000",
  courtName: "Галицький районний суд міста Львова",
  additionalDemands: "Стягнути судовий збір та витрати на правову допомогу — 10 000 грн",
  contactEmail: "test@example.com",
  contactPhone: "+380971234567",
};

const testDataMap: Record<string, Record<string, unknown>> = {
  "pozov-pro-rozirvannnya-shlyubu": divorceTestData,
  "pozov-pro-stygnennya-alimentiv": alimonyTestData,
  "pozov-pro-vidshkoduvannya-shkody": damagesTestData,
};

export function getTestData(templateSlug: string): Record<string, unknown> | null {
  return testDataMap[templateSlug] ?? null;
}
