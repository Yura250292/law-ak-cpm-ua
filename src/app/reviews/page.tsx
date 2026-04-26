import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Counter } from "@/components/motion/Counter";
import { MagneticButton } from "@/components/motion/MagneticButton";

export const metadata = {
  title: "Відгуки клієнтів — Адвокат Кабаль Анастасія Ігорівна",
  description:
    "Відгуки клієнтів адвоката Кабаль Анастасії Ігорівни. Реальні результати справ у сімейному, цивільному та господарському праві. Львів.",
};

const reviews = [
  {
    name: "Олена К.",
    text: "Зверталася з приводу розірвання шлюбу. Анастасія дуже уважно вислухала мою ситуацію, пояснила всі нюанси процесу та підготувала документи швидко і якісно. Справу вирішили без зайвих нервів. Дуже вдячна за професійний підхід!",
    rating: 5,
    service: "Розірвання шлюбу",
    date: "Листопад 2025",
  },
  {
    name: "Тарас М.",
    text: "Потрібна була допомога зі стягненням аліментів. Ситуація була непроста, бо колишня дружина переїхала в інше місто. Анастасія Ігорівна все зробила дистанційно, пояснювала кожен крок. Результат позитивний, аліменти призначені судом.",
    rating: 5,
    service: "Стягнення аліментів",
    date: "Жовтень 2025",
  },
  {
    name: "Ірина В.",
    text: "Замовляла позовну заяву про відшкодування моральної шкоди після ДТП. Документ підготовлений грамотно, з посиланнями на актуальне законодавство. Суд задовольнив позов повністю. Рекомендую!",
    rating: 5,
    service: "Відшкодування шкоди",
    date: "Вересень 2025",
  },
  {
    name: "Андрій Л.",
    text: "Звернувся за консультацією щодо поділу майна при розлученні. Анастасія чітко розклала все по поличках: що мені належить, які шанси в суді, скільки це займе часу. Після консультації замовив підготовку позову. Все пройшло успішно.",
    rating: 5,
    service: "Поділ майна",
    date: "Серпень 2025",
  },
  {
    name: "Наталія П.",
    text: "Дуже задоволена роботою! Мені потрібно було терміново підготувати заяву на аліменти. Анастасія зробила все за один день, документ був бездоганний. Суд все задовольнив без проблем. Дякую за оперативність!",
    rating: 5,
    service: "Стягнення аліментів",
    date: "Липень 2025",
  },
  {
    name: "Василь Р.",
    text: "Потрібна була позовна заява про відшкодування матеріальної шкоди. Справа була складна, багато доказів потрібно було правильно оформити. Анастасія Ігорівна підійшла до справи ретельно, врахувала всі деталі. Суд виніс рішення на мою користь.",
    rating: 5,
    service: "Відшкодування шкоди",
    date: "Червень 2025",
  },
  {
    name: "Марина С.",
    text: "Розводилася з чоловіком, ситуація була конфліктна. Боялася, що буде довго і складно. Але Анастасія все організувала максимально спокійно і професійно. Документи підготовлені ідеально, справа вирішена за два місяці.",
    rating: 4,
    service: "Розірвання шлюбу",
    date: "Травень 2025",
  },
  {
    name: "Дмитро Б.",
    text: "Замовляв документи онлайн, живу не у Львові. Все пройшло дистанційно без жодних проблем. Консультація по телефону, оплата онлайн, документ отримав на пошту. Зручний сервіс, юридично все грамотно.",
    rating: 5,
    service: "Стягнення аліментів",
    date: "Квітень 2025",
  },
  {
    name: "Оксана Г.",
    text: "Зверталася щодо стягнення заборгованості з аліментів. Колишній чоловік не платив більше року. Анастасія підготувала всі необхідні документи для виконавчої служби. Зараз борг поступово стягується. Нарешті зрушилася справа!",
    rating: 5,
    service: "Стягнення аліментів",
    date: "Березень 2025",
  },
  {
    name: "Юрій Н.",
    text: "Потрібна була юридична допомога з господарського спору. Анастасія Ігорівна швидко розібралася в ситуації, підготувала претензію та позовну заяву. Справа вирішена на мою користь. Цінна якість адвоката, що пояснює простою мовою.",
    rating: 5,
    service: "Господарський спір",
    date: "Лютий 2025",
  },
];

const caseResults = [
  {
    category: "Сімейне право",
    description:
      "Розірвання шлюбу з одночасним визначенням місця проживання дитини та стягненням аліментів.",
    result: "Шлюб розірвано, місце проживання дитини визначено з матір'ю, аліменти призначені у розмірі 1/4 доходу відповідача.",
  },
  {
    category: "Стягнення аліментів",
    description:
      "Стягнення заборгованості з аліментів за 2 роки та збільшення розміру аліментів у зв'язку зі зростанням потреб дитини.",
    result: "Суд стягнув заборгованість у повному обсязі та збільшив розмір аліментів до 1/3 доходу.",
  },
  {
    category: "Відшкодування шкоди",
    description:
      "Відшкодування моральної та матеріальної шкоди, завданої внаслідок ДТП. Винуватець відмовлявся від відповідальності.",
    result: "Суд задовольнив позов: стягнуто 85 000 грн матеріальної та 30 000 грн моральної шкоди.",
  },
  {
    category: "Поділ майна",
    description:
      "Поділ спільного майна подружжя після розірвання шлюбу: квартира, автомобіль, банківські вклади.",
    result: "Досягнуто мирову угоду: квартира залишилась клієнтці з компенсацією, автомобіль — колишньому чоловіку.",
  },
  {
    category: "Сімейне право",
    description:
      "Встановлення графіку побачень батька з дитиною після розлучення. Мати перешкоджала спілкуванню.",
    result: "Суд встановив графік побачень: щотижневі зустрічі та спільні канікули.",
  },
  {
    category: "Цивільне право",
    description:
      "Стягнення заборгованості за договором позики. Боржник не повертав кошти протягом року.",
    result: "Суд стягнув повну суму боргу з відсотками та судовими витратами.",
  },
];

const stats = [
  { count: 50, suffix: "+", label: "клієнтів" },
  { count: 95, suffix: "%", label: "задоволених" },
  { count: 20, suffix: "+", label: "виграних справ" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-5 w-5 ${i < rating ? "text-accent" : "text-border"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary py-20 text-white">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-accent/[0.06] blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Stagger className="space-y-4" delayChildren={0.1} staggerChildren={0.12}>
              <StaggerItem>
                <h1 className="text-3xl font-bold sm:text-5xl">
                  Відгуки клієнтів
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="max-w-2xl text-lg text-white/60">
                  Реальні відгуки людей, яким я допомогла вирішити юридичні питання.
                  Кожна історія — це довіра, яку я ціную.
                </p>
              </StaggerItem>
            </Stagger>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-b border-border bg-surface py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Stagger
              className="flex flex-wrap items-center justify-center gap-12 sm:gap-20"
              whileInView
              delayChildren={0.05}
              staggerChildren={0.12}
            >
              {stats.map((stat) => (
                <StaggerItem key={stat.label}>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary sm:text-4xl">
                    <Counter to={stat.count} suffix={stat.suffix} />
                  </p>
                  <p className="mt-1 text-sm text-muted">{stat.label}</p>
                </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-16 text-center">
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
                ВІДГУКИ
              </p>
              <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                Що кажуть клієнти
              </h2>
            </Reveal>

            <Stagger
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
              whileInView
              delayChildren={0.05}
              staggerChildren={0.08}
            >
              {reviews.map((review, idx) => (
                <StaggerItem key={idx} className="h-full">
                <Card className="flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_40px_-15px_rgba(201,169,110,0.25)]">
                  <CardHeader>
                    <div className="mb-3 flex items-center justify-between">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-muted">{review.date}</span>
                    </div>
                    <CardTitle className="text-base">{review.name}</CardTitle>
                    <CardDescription>
                      <span className="inline-block rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted">
                        {review.service}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm leading-relaxed text-muted">
                      &ldquo;{review.text}&rdquo;
                    </p>
                  </CardContent>
                </Card>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Case Results Section */}
        <section className="bg-surface py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-16 text-center">
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
                ПРАКТИКА
              </p>
              <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                Результати справ
              </h2>
              <p className="mt-4 text-lg text-muted">
                Деякі з успішно вирішених справ (дані знеособлені)
              </p>
            </Reveal>

            <Stagger
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
              whileInView
              delayChildren={0.05}
              staggerChildren={0.08}
            >
              {caseResults.map((caseItem, idx) => (
                <StaggerItem key={idx} className="h-full">
                <Card className="flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_40px_-15px_rgba(201,169,110,0.25)]">
                  <CardHeader>
                    <span className="mb-3 inline-block w-fit rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-primary">
                      {caseItem.category}
                    </span>
                    <CardTitle className="text-base">
                      {caseItem.description}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="rounded-xl bg-surface p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Результат
                      </p>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-primary">
                        {caseItem.result}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-primary py-24 text-white">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

          <Reveal className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Залишити відгук
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Якщо ви були моїм клієнтом, буду вдячна за ваш відгук.
              Це допомагає іншим людям зробити правильний вибір.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <MagneticButton className="inline-block">
                <a
                  href="https://www.instagram.com/k_anastasiya_i/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="rounded-xl bg-accent px-10 py-4 text-base font-semibold text-primary shadow-lg shadow-accent/20 transition hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/30">
                    Написати в Instagram
                  </Button>
                </a>
              </MagneticButton>
              <Link href="/services">
                <Button className="rounded-xl border-2 border-white bg-transparent px-10 py-4 text-base font-semibold text-white transition hover:bg-white hover:text-primary">
                  Замовити документ
                </Button>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </>
  );
}
