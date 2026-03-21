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
      "Адвокат підготує документ та надішле його на вашу електронну пошту.",
  },
];

const trustBadges = [
  { icon: "🛡️", label: "Захист даних" },
  { icon: "⚡", label: "Швидка підготовка" },
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
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
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
                <h1 className="animate-fade-in-up text-3xl sm:text-5xl font-bold leading-[1.1] tracking-tight text-primary lg:text-6xl">
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
                  <Link href="/services" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto rounded-xl bg-accent px-8 py-3 text-base font-semibold text-primary shadow-lg shadow-accent/20 transition hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/30">
                      Замовити документ
                    </Button>
                  </Link>
                  <Link href="/about" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto rounded-xl border-2 border-primary bg-transparent px-8 py-3 text-base font-semibold text-primary transition hover:bg-primary hover:text-white">
                      Дізнатися більше
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right column — Themis & document templates */}
              <div className="animate-fade-in-up-delay-2 relative flex items-center justify-center">
                <div className="relative h-[480px] w-full overflow-hidden rounded-3xl bg-surface">
                  {/* Background decorations */}
                  <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-accent/8 blur-2xl animate-gentle-pulse" />
                  <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-accent/5 blur-xl animate-gentle-pulse" />

                  {/* Themis SVG */}
                  <div className="absolute left-1/2 top-4 -translate-x-1/2 animate-scale-in">
                    <svg width="120" height="160" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                      {/* Head */}
                      <circle cx="60" cy="22" r="14" fill="#0B0B0B"/>
                      {/* Blindfold */}
                      <rect x="44" y="18" width="32" height="6" rx="3" fill="#FFD600"/>
                      {/* Body */}
                      <path d="M52 36 L60 90 L68 36" fill="#0B0B0B"/>
                      <path d="M48 90 L60 90 L72 90 L76 145 L44 145 Z" fill="#0B0B0B"/>
                      {/* Arms holding scales */}
                      <line x1="60" y1="44" x2="20" y2="54" stroke="#0B0B0B" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="60" y1="44" x2="100" y2="54" stroke="#0B0B0B" strokeWidth="3" strokeLinecap="round"/>
                      {/* Left scale */}
                      <line x1="20" y1="54" x2="20" y2="72" stroke="#FFD600" strokeWidth="1.5"/>
                      <path d="M10 72 Q20 82 30 72" fill="none" stroke="#FFD600" strokeWidth="2"/>
                      <ellipse cx="20" cy="73" rx="10" ry="3" fill="#FFD600" opacity="0.3"/>
                      {/* Right scale */}
                      <line x1="100" y1="54" x2="100" y2="68" stroke="#FFD600" strokeWidth="1.5"/>
                      <path d="M90 68 Q100 78 110 68" fill="none" stroke="#FFD600" strokeWidth="2"/>
                      <ellipse cx="100" cy="69" rx="10" ry="3" fill="#FFD600" opacity="0.3"/>
                      {/* Sword */}
                      <line x1="60" y1="38" x2="60" y2="2" stroke="#FFD600" strokeWidth="2"/>
                      <line x1="54" y1="10" x2="66" y2="10" stroke="#FFD600" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>

                  {/* Floating document template cards */}
                  <div className="absolute left-3 top-[170px] animate-scale-in-delay-1">
                    <div className="animate-float group w-[140px] rounded-xl border border-border bg-white p-3 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                        <span className="text-base">📝</span>
                      </div>
                      <p className="text-xs font-semibold text-primary leading-tight">Позовна заява</p>
                      <p className="mt-1 text-[10px] text-muted">Шаблон</p>
                    </div>
                  </div>

                  <div className="absolute right-3 top-[155px] animate-scale-in-delay-2">
                    <div className="animate-float-delay-1 group w-[140px] rounded-xl border border-border bg-white p-3 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                        <span className="text-base">📋</span>
                      </div>
                      <p className="text-xs font-semibold text-primary leading-tight">Скарга</p>
                      <p className="mt-1 text-[10px] text-muted">Зразок</p>
                    </div>
                  </div>

                  <div className="absolute left-[15%] bottom-[85px] animate-scale-in-delay-2">
                    <div className="animate-float-delay-2 group w-[140px] rounded-xl border border-border bg-white p-3 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                        <span className="text-base">⚖️</span>
                      </div>
                      <p className="text-xs font-semibold text-primary leading-tight">Договір</p>
                      <p className="mt-1 text-[10px] text-muted">Шаблон</p>
                    </div>
                  </div>

                  <div className="absolute right-[10%] bottom-[70px] animate-scale-in-delay-3">
                    <div className="animate-float group w-[140px] rounded-xl border border-border bg-white p-3 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                        <span className="text-base">🏛️</span>
                      </div>
                      <p className="text-xs font-semibold text-primary leading-tight">Заява до суду</p>
                      <p className="mt-1 text-[10px] text-muted">Зразок</p>
                    </div>
                  </div>

                  {/* Bottom accent bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 animate-shimmer rounded-b-3xl" />

                  {/* Decorative scales of justice watermark */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-[0.06]">
                    <svg width="80" height="50" viewBox="0 0 80 50" fill="currentColor">
                      <rect x="38" y="0" width="4" height="50" rx="2"/>
                      <rect x="20" y="48" width="40" height="4" rx="2"/>
                      <line x1="40" y1="10" x2="10" y2="18" stroke="currentColor" strokeWidth="3"/>
                      <line x1="40" y1="10" x2="70" y2="18" stroke="currentColor" strokeWidth="3"/>
                      <circle cx="10" cy="22" r="8"/>
                      <circle cx="70" cy="22" r="8"/>
                    </svg>
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
