import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { blogPosts } from "../src/lib/blog-data";
import { practiceAreas } from "../src/lib/practice-areas";
import { newBlock, type Block } from "../src/lib/content-blocks";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Хардкод-дані відгуків/кейсів/зразків (копія з відповідних сторінок; після
// сіду керуються з адмінки, а первинні масиви лишаються джерелом імпорту).
const reviews = [
  { name: "Олена К.", text: "Зверталася з приводу розірвання шлюбу. Анастасія дуже уважно вислухала мою ситуацію, пояснила всі нюанси процесу та підготувала документи швидко і якісно. Справу вирішили без зайвих нервів. Дуже вдячна за професійний підхід!", rating: 5, service: "Розірвання шлюбу", date: "Листопад 2025" },
  { name: "Тарас М.", text: "Потрібна була допомога зі стягненням аліментів. Ситуація була непроста, бо колишня дружина переїхала в інше місто. Анастасія Ігорівна все зробила дистанційно, пояснювала кожен крок. Результат позитивний, аліменти призначені судом.", rating: 5, service: "Стягнення аліментів", date: "Жовтень 2025" },
  { name: "Ірина В.", text: "Замовляла позовну заяву про відшкодування моральної шкоди після ДТП. Документ підготовлений грамотно, з посиланнями на актуальне законодавство. Суд задовольнив позов повністю. Рекомендую!", rating: 5, service: "Відшкодування шкоди", date: "Вересень 2025" },
  { name: "Андрій Л.", text: "Звернувся за консультацією щодо поділу майна при розлученні. Анастасія чітко розклала все по поличках: що мені належить, які шанси в суді, скільки це займе часу. Після консультації замовив підготовку позову. Все пройшло успішно.", rating: 5, service: "Поділ майна", date: "Серпень 2025" },
  { name: "Наталія П.", text: "Дуже задоволена роботою! Мені потрібно було терміново підготувати заяву на аліменти. Анастасія зробила все за один день, документ був бездоганний. Суд все задовольнив без проблем. Дякую за оперативність!", rating: 5, service: "Стягнення аліментів", date: "Липень 2025" },
  { name: "Василь Р.", text: "Потрібна була позовна заява про відшкодування матеріальної шкоди. Справа була складна, багато доказів потрібно було правильно оформити. Анастасія Ігорівна підійшла до справи ретельно, врахувала всі деталі. Суд виніс рішення на мою користь.", rating: 5, service: "Відшкодування шкоди", date: "Червень 2025" },
  { name: "Марина С.", text: "Розводилася з чоловіком, ситуація була конфліктна. Боялася, що буде довго і складно. Але Анастасія все організувала максимально спокійно і професійно. Документи підготовлені ідеально, справа вирішена за два місяці.", rating: 4, service: "Розірвання шлюбу", date: "Травень 2025" },
  { name: "Дмитро Б.", text: "Замовляв документи онлайн, живу не у Львові. Все пройшло дистанційно без жодних проблем. Консультація по телефону, оплата онлайн, документ отримав на пошту. Зручний сервіс, юридично все грамотно.", rating: 5, service: "Стягнення аліментів", date: "Квітень 2025" },
  { name: "Оксана Г.", text: "Зверталася щодо стягнення заборгованості з аліментів. Колишній чоловік не платив більше року. Анастасія підготувала всі необхідні документи для виконавчої служби. Зараз борг поступово стягується. Нарешті зрушилася справа!", rating: 5, service: "Стягнення аліментів", date: "Березень 2025" },
  { name: "Юрій Н.", text: "Потрібна була юридична допомога з господарського спору. Анастасія Ігорівна швидко розібралася в ситуації, підготувала претензію та позовну заяву. Справа вирішена на мою користь. Цінна якість адвоката, що пояснює простою мовою.", rating: 5, service: "Господарський спір", date: "Лютий 2025" },
];

const caseResults = [
  { category: "Сімейне право", description: "Розірвання шлюбу з одночасним визначенням місця проживання дитини та стягненням аліментів.", result: "Шлюб розірвано, місце проживання дитини визначено з матір'ю, аліменти призначені у розмірі 1/4 доходу відповідача." },
  { category: "Стягнення аліментів", description: "Стягнення заборгованості з аліментів за 2 роки та збільшення розміру аліментів у зв'язку зі зростанням потреб дитини.", result: "Суд стягнув заборгованість у повному обсязі та збільшив розмір аліментів до 1/3 доходу." },
  { category: "Відшкодування шкоди", description: "Відшкодування моральної та матеріальної шкоди, завданої внаслідок ДТП. Винуватець відмовлявся від відповідальності.", result: "Суд задовольнив позов: стягнуто 85 000 грн матеріальної та 30 000 грн моральної шкоди." },
  { category: "Поділ майна", description: "Поділ спільного майна подружжя після розірвання шлюбу: квартира, автомобіль, банківські вклади.", result: "Досягнуто мирову угоду: квартира залишилась клієнтці з компенсацією, автомобіль — колишньому чоловіку." },
  { category: "Сімейне право", description: "Встановлення графіку побачень батька з дитиною після розлучення. Мати перешкоджала спілкуванню.", result: "Суд встановив графік побачень: щотижневі зустрічі та спільні канікули." },
  { category: "Цивільне право", description: "Стягнення заборгованості за договором позики. Боржник не повертав кошти протягом року.", result: "Суд стягнув повну суму боргу з відсотками та судовими витратами." },
];

const samples = [
  { title: "Позовна заява", description: "Зразок позовної заяви до суду з правильною структурою, реквізитами та обґрунтуванням вимог.", fileUrl: "/templates/pozovna-zayava-zrazok.pdf", sizeLabel: "PDF · 240 KB", iconKey: "claim" },
  { title: "Скарга", description: "Зразок скарги на дії або рішення органу чи посадової особи з посиланням на норми законодавства.", fileUrl: "/templates/skarga-zrazok.pdf", sizeLabel: "PDF · 180 KB", iconKey: "complaint" },
  { title: "Договір", description: "Зразок цивільно-правового договору з ключовими умовами, правами та обов'язками сторін.", fileUrl: "/templates/dogovir-zrazok.pdf", sizeLabel: "PDF · 320 KB", iconKey: "contract" },
  { title: "Заява до суду", description: "Зразок процесуальної заяви до суду — клопотання чи заяви по суті справи за встановленою формою.", fileUrl: "/templates/zayava-do-sudu-zrazok.pdf", sizeLabel: "PDF · 280 KB", iconKey: "court" },
];

function contentToBlocks(content: string): Block[] {
  return content
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const b = newBlock("paragraph");
      if (b.type === "paragraph") b.text = p;
      return b;
    });
}

async function main() {
  // Статті — upsert за slug (ідемпотентно).
  for (const post of blogPosts) {
    const blocks = contentToBlocks(post.content);
    await prisma.article.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        author: post.author,
        readTime: post.readTime,
        blocks: blocks as unknown as object,
      },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        author: post.author,
        readTime: post.readTime,
        blocks: blocks as unknown as object,
        status: "PUBLISHED",
        publishedAt: new Date(post.date),
      },
    });
  }
  console.log(`Статті: ${blogPosts.length}`);

  // Практики — upsert за slug.
  for (let i = 0; i < practiceAreas.length; i++) {
    const pa = practiceAreas[i];
    await prisma.practiceArea.upsert({
      where: { slug: pa.slug },
      update: {
        title: pa.title,
        shortDescription: pa.shortDescription,
        icon: pa.icon,
        description: pa.description,
        services: pa.services,
        advantages: pa.advantages,
        process: pa.process as unknown as object,
        sortOrder: i,
      },
      create: {
        slug: pa.slug,
        title: pa.title,
        shortDescription: pa.shortDescription,
        icon: pa.icon,
        description: pa.description,
        services: pa.services,
        advantages: pa.advantages,
        process: pa.process as unknown as object,
        status: "PUBLISHED",
        sortOrder: i,
      },
    });
  }
  console.log(`Практики: ${practiceAreas.length}`);

  // Відгуки та кейси не мають природного унікального ключа —
  // перезаписуємо повністю (лише сідовані записи; фото додаються з адмінки поверх).
  await prisma.review.deleteMany({});
  await prisma.review.createMany({
    data: reviews.map((r, i) => ({
      kind: "review",
      name: r.name,
      text: r.text,
      rating: r.rating,
      service: r.service,
      photos: [],
      featured: i < 3,
      status: "PUBLISHED" as const,
      sortOrder: i,
    })),
  });
  await prisma.review.createMany({
    data: caseResults.map((c, i) => ({
      kind: "case",
      name: c.category,
      text: c.description,
      result: c.result,
      rating: 5,
      service: c.category,
      photos: [],
      status: "PUBLISHED" as const,
      sortOrder: i,
    })),
  });
  console.log(`Відгуки: ${reviews.length}, Кейси: ${caseResults.length}`);

  // Зразки — перезаписуємо повністю.
  await prisma.sample.deleteMany({});
  await prisma.sample.createMany({
    data: samples.map((s, i) => ({
      title: s.title,
      description: s.description,
      fileUrl: s.fileUrl,
      sizeLabel: s.sizeLabel,
      iconKey: s.iconKey,
      status: "PUBLISHED" as const,
      sortOrder: i,
    })),
  });
  console.log(`Зразки: ${samples.length}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
