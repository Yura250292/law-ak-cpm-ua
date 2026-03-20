import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const templates = [
    {
      slug: "pozov-pro-rozirvannnya-shlyubu",
      title: "Позов про розірвання шлюбу",
      description:
        "Підготовка позовної заяви про розірвання шлюбу відповідно до Сімейного кодексу України. Документ включає всі необхідні реквізити та посилання на статті закону.",
      category: "Сімейне право",
      price: 499.0,
      promptHint:
        "Склади позовну заяву про розірвання шлюбу згідно ст. 105-112 Сімейного кодексу України та ст. 175 ЦПК України. Документ має містити: шапку з назвою суду, дані позивача та відповідача, зміст позову з посиланнями на норми закону, прохальну частину, перелік додатків.",
      fields: {
        steps: [
          {
            name: "partyDetails",
            fields: [
              "plaintiff.fullName",
              "plaintiff.birthDate",
              "plaintiff.registrationAddress",
              "plaintiff.phone",
              "defendant.fullName",
              "defendant.registrationAddress",
            ],
          },
          {
            name: "circumstances",
            fields: [
              "marriageDate",
              "marriagePlace",
              "hasChildren",
              "childrenDetails",
              "separationDate",
              "circumstances",
            ],
          },
          {
            name: "requirements",
            fields: ["demands", "courtName", "contactEmail"],
          },
        ],
      },
      sortOrder: 1,
    },
    {
      slug: "pozov-pro-stygnennya-alimentiv",
      title: "Позов про стягнення аліментів",
      description:
        "Позовна заява про стягнення аліментів на утримання дитини. Розрахунок суми аліментів, посилання на статті Сімейного кодексу України.",
      category: "Сімейне право",
      price: 599.0,
      promptHint:
        "Склади позовну заяву про стягнення аліментів на утримання неповнолітньої дитини згідно ст. 180-198 Сімейного кодексу України. Вкажи розрахунок розміру аліментів, обґрунтування потреб дитини.",
      fields: {
        steps: [
          {
            name: "partyDetails",
            fields: [
              "plaintiff.fullName",
              "plaintiff.registrationAddress",
              "plaintiff.phone",
              "defendant.fullName",
              "defendant.registrationAddress",
              "defendant.workplace",
            ],
          },
          {
            name: "circumstances",
            fields: [
              "childName",
              "childBirthDate",
              "marriageDate",
              "divorceDate",
              "childNeeds",
              "defendantIncome",
            ],
          },
          {
            name: "requirements",
            fields: [
              "alimentAmount",
              "demands",
              "courtName",
              "contactEmail",
            ],
          },
        ],
      },
      sortOrder: 2,
    },
    {
      slug: "pozov-pro-vidshkoduvannya-shkody",
      title: "Позов про відшкодування шкоди",
      description:
        "Позовна заява про відшкодування матеріальної та моральної шкоди відповідно до Цивільного кодексу України.",
      category: "Цивільне право",
      price: 799.0,
      promptHint:
        "Склади позовну заяву про відшкодування матеріальної та/або моральної шкоди згідно ст. 1166-1168 Цивільного кодексу України. Вкажи обставини завдання шкоди, розрахунок збитків, докази.",
      fields: {
        steps: [
          {
            name: "partyDetails",
            fields: [
              "plaintiff.fullName",
              "plaintiff.registrationAddress",
              "plaintiff.phone",
              "defendant.fullName",
              "defendant.registrationAddress",
            ],
          },
          {
            name: "circumstances",
            fields: [
              "incidentDate",
              "incidentDescription",
              "damageType",
              "damageAmount",
              "evidence",
            ],
          },
          {
            name: "requirements",
            fields: [
              "compensationAmount",
              "demands",
              "courtName",
              "contactEmail",
            ],
          },
        ],
      },
      sortOrder: 3,
    },
  ];

  for (const template of templates) {
    await prisma.documentTemplate.upsert({
      where: { slug: template.slug },
      update: template,
      create: template,
    });
  }

  console.log("Seeded 3 document templates");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
