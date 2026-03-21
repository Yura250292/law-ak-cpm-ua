import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { ReviewsSection } from "@/components/ReviewsSection";
import { FAQSection } from "@/components/FAQSection";
import { generalFAQ } from "@/lib/faq-data";

export const revalidate = 60;

const services = [
  {
    icon: "📝",
    title: "Розірвання шлюбу",
    description:
      "Підготовка позовної заяви про розірвання шлюбу з урахуванням усіх обставин справи.",
    price: "Від 499 грн",
    slug: "pozov-pro-rozirvannnya-shlyubu",
  },
  {
    icon: "👶",
    title: "Стягнення аліментів",
    description:
      "Документи для стягнення аліментів на утримання дитини або іншого члена сім'ї.",
    price: "Від 499 грн",
    slug: "pozov-pro-stygnennya-alimentiv",
  },
  {
    icon: "⚖️",
    title: "Відшкодування шкоди",
    description:
      "Позовна заява про відшкодування матеріальної або моральної шкоди.",
    price: "Від 499 грн",
    slug: "pozov-pro-vidshkoduvannya-shkody",
  },
];

const steps = [
  {
    number: "1",
    title: "Оберіть документ",
    description:
      "Виберіть тип юридичного документа з нашого каталогу послуг.",
  },
  {
    number: "2",
    title: "Заповніть форму",
    description:
      "Вкажіть необхідні дані: інформацію про сторони, обставини справи та вимоги.",
  },
  {
    number: "3",
    title: "Отримайте документ",
    description:
      "Після оплати отримайте готовий юридичний документ у форматі PDF на вашу пошту.",
  },
];

const trustBadges = [
  { icon: "🛡️", label: "Захист даних" },
  { icon: "⚡", label: "Генерація за 5 хвилин" },
  { icon: "📄", label: "Відповідність законодавству" },
  { icon: "✅", label: "Гарантія якості" },
];

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Left column */}
              <div className="space-y-8">
                {/* Badge */}
                <div className="animate-fade-in-up">
                  <span className="inline-block rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted">
                    Юридичні послуги онлайн
                  </span>
                </div>

                {/* Heading */}
                <h1 className="animate-fade-in-up text-5xl font-bold leading-[1.1] tracking-tight text-primary lg:text-6xl">
                  Професійні юридичні
                  <br />
                  документи за хвилини
                </h1>

                {/* Subtitle */}
                <p className="animate-fade-in-up-delay-1 max-w-lg text-lg leading-relaxed text-muted">
                  Підготовка позовних заяв, юридичних документів та консультацій
                  онлайн. Швидко, зручно та доступно — без черг та зайвих витрат.
                </p>

                {/* Buttons */}
                <div className="animate-fade-in-up-delay-2 flex flex-col gap-4 sm:flex-row">
                  <Link href="/services">
                    <Button className="rounded-xl bg-accent px-8 py-3 text-base font-semibold text-primary shadow-lg shadow-accent/20 transition hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/30">
                      Замовити документ
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button className="rounded-xl border-2 border-primary bg-transparent px-8 py-3 text-base font-semibold text-primary transition hover:bg-primary hover:text-white">
                      Дізнатися більше
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right column — abstract visual */}
              <div className="animate-fade-in-up-delay-2 relative flex items-center justify-center">
                <div className="relative h-[420px] w-full overflow-hidden rounded-3xl bg-surface">
                  {/* Geometric decorations */}
                  <div className="absolute left-8 top-8 h-32 w-32 rounded-2xl border-2 border-accent/30 bg-accent/5" />
                  <div className="absolute bottom-12 right-12 h-40 w-40 rounded-full border-2 border-primary/10 bg-primary/5" />
                  <div className="absolute right-16 top-16 h-24 w-24 rounded-xl bg-accent/10" />
                  <div className="absolute bottom-8 left-16 h-20 w-20 rounded-full bg-accent/15" />
                  {/* Center icon cluster */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-xl">
                      <span className="text-4xl">📄</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      <div className="h-2 w-6 rounded-full bg-accent/60" />
                      <div className="h-2 w-2 rounded-full bg-accent" />
                    </div>
                    <p className="text-sm font-medium text-muted">
                      Юридичні документи
                    </p>
                  </div>
                  {/* Dotted pattern */}
                  <div className="absolute right-4 top-4 grid grid-cols-4 gap-2 opacity-20">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-primary"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust Bar ── */}
        <section className="border-y border-border bg-surface py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8">
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 text-sm text-muted"
                >
                  <span className="text-lg">{badge.icon}</span>
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services Section ── */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="mb-16 text-center">
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
                ПОСЛУГИ
              </p>
              <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                Оберіть потрібний документ
              </h2>
            </div>

            {/* Cards grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/document/${service.slug}`}
                  className="group"
                >
                  <Card className="h-full rounded-2xl border border-border bg-white p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <CardHeader className="p-8">
                      {/* Icon */}
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-surface">
                        <span className="text-2xl">{service.icon}</span>
                      </div>

                      <CardTitle className="mb-2 text-xl font-bold text-primary">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="mb-4 text-sm leading-relaxed text-muted">
                        {service.description}
                      </CardDescription>

                      {/* Price + link */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-semibold text-accent">
                          {service.price}
                        </span>
                        <span className="text-sm font-medium text-primary transition group-hover:translate-x-1">
                          Детальніше&nbsp;&rarr;
                        </span>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works Section ── */}
        <section className="bg-surface py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                Як це працює
              </h2>
              <p className="mt-4 text-lg text-muted">
                Три прості кроки до готового юридичного документа
              </p>
            </div>

            {/* Steps */}
            <div className="relative grid gap-12 lg:grid-cols-3 lg:gap-8">
              {/* Connecting line (desktop) */}
              <div className="absolute left-[16.67%] right-[16.67%] top-6 hidden h-px border-t-2 border-dashed border-border lg:block" />

              {steps.map((step, idx) => (
                <div
                  key={step.number}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Connecting line (mobile) */}
                  {idx < steps.length - 1 && (
                    <div className="absolute left-1/2 top-12 h-full w-px -translate-x-1/2 border-l-2 border-dashed border-border lg:hidden" />
                  )}

                  {/* Number circle */}
                  <div className="relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-accent">
                    {step.number}
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-primary">
                    {step.title}
                  </h3>
                  <p className="max-w-xs text-sm leading-relaxed text-muted">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Reviews Section ── */}
        <ReviewsSection />

        {/* ── FAQ Section ── */}
        <FAQSection
          title="Часті запитання"
          subtitle="Відповіді на найпоширеніші питання про наші послуги"
          items={generalFAQ}
        />

        {/* ── CTA Section ── */}
        <section className="relative overflow-hidden bg-primary py-24 text-white">
          {/* Subtle accent glow */}
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold sm:text-4xl">Готові почати?</h2>
            <p className="mt-4 text-lg text-white/60">
              Оберіть необхідний документ та отримайте його вже сьогодні.
              Професійна юридична допомога — на відстані одного кліку.
            </p>
            <div className="mt-10">
              <Link href="/services">
                <Button className="rounded-xl bg-accent px-10 py-4 text-base font-semibold text-primary shadow-lg shadow-accent/20 transition hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/30">
                  Замовити документ
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
