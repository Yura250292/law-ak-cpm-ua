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

const serviceIcons = {
  divorce: (
    <svg className="h-6 w-6 text-primary/70 transition-colors duration-300 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  alimony: (
    <svg className="h-6 w-6 text-primary/70 transition-colors duration-300 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  damages: (
    <svg className="h-6 w-6 text-primary/70 transition-colors duration-300 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
    </svg>
  ),
};

const services = [
  {
    icon: serviceIcons.divorce,
    title: "Розірвання шлюбу",
    description:
      "Підготовка позовної заяви про розірвання шлюбу з урахуванням усіх обставин справи.",
    price: "Від 499 грн",
    slug: "pozov-pro-rozirvannnya-shlyubu",
  },
  {
    icon: serviceIcons.alimony,
    title: "Стягнення аліментів",
    description:
      "Документи для стягнення аліментів на утримання дитини або іншого члена сім'ї.",
    price: "Від 499 грн",
    slug: "pozov-pro-stygnennya-alimentiv",
  },
  {
    icon: serviceIcons.damages,
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
  {
    label: "Захист даних",
    icon: (
      <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    label: "Швидка підготовка",
    icon: (
      <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    label: "Відповідність законодавству",
    icon: (
      <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    label: "Гарантія якості",
    icon: (
      <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
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

              {/* Right column — Premium document showcase */}
              <div className="animate-fade-in-up-delay-2 relative flex items-center justify-center">
                <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A] p-6 sm:p-8">
                  {/* Abstract legal background patterns */}
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {/* Scales of justice watermark */}
                    <svg className="absolute -right-6 -top-6 opacity-[0.04]" width="200" height="200" viewBox="0 0 200 200" fill="none" stroke="white" strokeWidth="1.5">
                      <line x1="100" y1="20" x2="100" y2="180" />
                      <line x1="60" y1="170" x2="140" y2="170" />
                      <line x1="100" y1="40" x2="40" y2="60" />
                      <line x1="100" y1="40" x2="160" y2="60" />
                      <path d="M25 60 Q40 90 55 60" />
                      <path d="M145 60 Q160 90 175 60" />
                    </svg>
                    {/* Column pillars */}
                    <svg className="absolute -left-4 bottom-0 opacity-[0.03]" width="120" height="280" viewBox="0 0 120 280" fill="none" stroke="white" strokeWidth="1">
                      <rect x="10" y="20" width="8" height="240" />
                      <rect x="35" y="20" width="8" height="240" />
                      <rect x="60" y="20" width="8" height="240" />
                      <rect x="0" y="10" width="80" height="10" rx="2" />
                      <rect x="0" y="260" width="80" height="10" rx="2" />
                    </svg>
                    {/* Geometric lines */}
                    <svg className="absolute right-10 bottom-10 opacity-[0.05]" width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="0.5">
                      <line x1="0" y1="0" x2="100" y2="100" />
                      <line x1="20" y1="0" x2="100" y2="80" />
                      <line x1="40" y1="0" x2="100" y2="60" />
                      <line x1="0" y1="20" x2="80" y2="100" />
                      <line x1="0" y1="40" x2="60" y2="100" />
                    </svg>
                    {/* Subtle gradient glows */}
                    <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent/[0.06] blur-3xl" />
                    <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent/[0.04] blur-3xl" />
                  </div>

                  {/* Document cards grid */}
                  <div className="relative grid grid-cols-2 gap-4">
                    {/* Card: Позовна заява */}
                    <div className="group cursor-pointer rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-accent/[0.05]">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] transition-colors duration-300 group-hover:bg-accent/20">
                        <svg className="h-5 w-5 text-white/70 transition-colors duration-300 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-white/90">Позовна заява</p>
                      <p className="mt-1 text-xs text-white/40">Шаблон</p>
                    </div>

                    {/* Card: Скарга */}
                    <div className="group cursor-pointer rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-accent/[0.05]">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] transition-colors duration-300 group-hover:bg-accent/20">
                        <svg className="h-5 w-5 text-white/70 transition-colors duration-300 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H6m12 10.5H6a2.25 2.25 0 01-2.25-2.25V6.108c0-1.135.845-2.098 1.976-2.192a48.424 48.424 0 011.123-.08M15.75 18.75a3 3 0 01.954-2.194" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-white/90">Скарга</p>
                      <p className="mt-1 text-xs text-white/40">Зразок</p>
                    </div>

                    {/* Card: Договір */}
                    <div className="group cursor-pointer rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-accent/[0.05]">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] transition-colors duration-300 group-hover:bg-accent/20">
                        <svg className="h-5 w-5 text-white/70 transition-colors duration-300 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-white/90">Договір</p>
                      <p className="mt-1 text-xs text-white/40">Шаблон</p>
                    </div>

                    {/* Card: Заява до суду */}
                    <div className="group cursor-pointer rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-accent/[0.05]">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] transition-colors duration-300 group-hover:bg-accent/20">
                        <svg className="h-5 w-5 text-white/70 transition-colors duration-300 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-white/90">Заява до суду</p>
                      <p className="mt-1 text-xs text-white/40">Зразок</p>
                    </div>
                  </div>

                  {/* Bottom accent bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 animate-shimmer rounded-b-3xl" />
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
                  className="flex items-center gap-2.5 text-sm text-muted"
                >
                  {badge.icon}
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
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-surface transition-colors duration-300 group-hover:bg-accent/10">
                        {service.icon}
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
