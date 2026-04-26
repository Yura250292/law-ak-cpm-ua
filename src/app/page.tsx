import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { ReviewsSection } from "@/components/ReviewsSection";
import { FAQSection } from "@/components/FAQSection";
import { generalFAQ } from "@/lib/faq-data";

export const revalidate = 60;

const practiceAreas = [
  {
    slug: "simejne-pravo",
    title: "Сімейне право",
    description:
      "Розлучення, аліменти, поділ майна, опіка над дітьми, позбавлення батьківських прав.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    slug: "cyvilne-pravo",
    title: "Цивільне право",
    description:
      "Договори, відшкодування шкоди, спадкові спори, захист прав споживачів.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 17V5a2 2 0 0 0-2-2H4M22 17H7a2 2 0 0 0-2 2 2 2 0 0 0 2 2h12a3 3 0 0 0 3-3z M9 7h6 M9 11h6" />
      </svg>
    ),
  },
  {
    slug: "gospodarske-pravo",
    title: "Господарське право",
    description:
      "Договори, корпоративні спори, банкрутство, реєстрація бізнесу.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
];

const processSteps = [
  {
    number: "01",
    title: "Залишите заявку",
    description: "Опишіть ситуацію коротко у формі або месенджері.",
  },
  {
    number: "02",
    title: "Безкоштовна консультація",
    description: "Зустріч 30 хв — оцінюю шанси і пропоную план.",
  },
  {
    number: "03",
    title: "Підготовка документів",
    description: "Готую позов, скаргу або договір — крок за кроком.",
  },
  {
    number: "04",
    title: "Результат у руки",
    description: "Виграна справа, оформлені документи, спокій.",
  },
];

const heroTrustSignals = [
  {
    title: "10+ років",
    subtitle: "практики",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3" />
      </svg>
    ),
  },
  {
    title: "500+ справ",
    subtitle: "доведено до перемоги",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z M7 21h10 M12 3v18 M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
      </svg>
    ),
  },
  {
    title: "Конфіденційність",
    subtitle: "адвокатська таємниця",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

const darkTrustItems = [
  {
    label: "Свідоцтво № 12345",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z M7 21h10 M12 3v18 M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
      </svg>
    ),
  },
  {
    label: "Член НААУ",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="8" r="7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" />
      </svg>
    ),
  },
  {
    label: "Відповідь за 30 хв",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    label: "Онлайн по Україні",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
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
                {/* Eyebrow badge with golden dot */}
                <div className="animate-fade-in-up">
                  <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
                    <span className="h-2 w-2 rounded-full bg-accent animate-gentle-pulse" />
                    Адвокат · Львів · Онлайн по Україні
                  </span>
                </div>

                {/* Heading */}
                <h1 className="animate-fade-in-up font-display text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight text-primary lg:text-6xl">
                  Юридичний захист,
                  <br />
                  якому <span className="text-gold-gradient italic">довіряють</span>
                </h1>

                {/* Subtitle */}
                <p className="animate-fade-in-up-delay-1 max-w-lg text-lg leading-relaxed text-muted">
                  10+ років практики у Львові. Сімейне, цивільне, господарське та
                  адміністративне право. Підготовка позовних заяв і консультації
                  онлайн по всій Україні.
                </p>

                {/* Buttons */}
                <div className="animate-fade-in-up-delay-2 flex flex-col gap-4 sm:flex-row">
                  <Link href="/consultation" className="w-full sm:w-auto">
                    <Button className="group w-full sm:w-auto rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-light hover:shadow-xl">
                      <span>Безкоштовна консультація</span>
                      <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </Link>
                  <Link href="#process" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto rounded-xl border-2 border-primary bg-transparent px-8 py-3 text-base font-semibold text-primary transition hover:bg-primary hover:text-white">
                      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                      </svg>
                      <span>Як це працює</span>
                    </Button>
                  </Link>
                </div>

                {/* Hero trust signals */}
                <div className="animate-fade-in-up-delay-3 grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
                  {heroTrustSignals.map((signal) => (
                    <div key={signal.title} className="flex items-center gap-3">
                      <span className="text-accent shrink-0">{signal.icon}</span>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-bold text-primary">
                          {signal.title}
                        </span>
                        <span className="text-xs text-muted">
                          {signal.subtitle}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column — Premium document showcase */}
              <div className="animate-fade-in-up-delay-2 relative flex items-center justify-center">
                <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1C1E] via-[#2A2A2D] to-[#0E0E10] p-6 sm:p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] ring-1 ring-accent/20">
                  {/* Slate micro-texture overlay */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(135deg, #ffffff 0 1px, transparent 1px 4px), repeating-linear-gradient(45deg, #ffffff 0 1px, transparent 1px 6px)",
                    }}
                  />
                  {/* Corner studs (як на плитці) */}
                  <span className="pointer-events-none absolute left-3 top-3 h-1.5 w-1.5 rounded-full bg-accent/40 ring-1 ring-accent/20" />
                  <span className="pointer-events-none absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-accent/40 ring-1 ring-accent/20" />
                  <span className="pointer-events-none absolute left-3 bottom-3 h-1.5 w-1.5 rounded-full bg-accent/40 ring-1 ring-accent/20" />
                  <span className="pointer-events-none absolute right-3 bottom-3 h-1.5 w-1.5 rounded-full bg-accent/40 ring-1 ring-accent/20" />
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

                  {/* Card eyebrow + mini K+A logo */}
                  <div className="relative mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05] ring-1 ring-accent/30">
                      <Image src="/logo-mark.svg" alt="" width={32} height={32} className="opacity-90" />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                        Зразки документів
                      </span>
                      <span className="font-display text-base font-semibold text-white/95">
                        Завантажте безкоштовно
                      </span>
                    </div>
                  </div>

                  {/* Document cards grid */}
                  <div className="relative grid grid-cols-2 gap-4">
                    {/* Card: Позовна заява */}
                    <a
                      href="/templates/pozovna-zayava-zrazok.pdf"
                      download
                      className="group rounded-2xl border border-accent-light/15 bg-white/[0.04] p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-white/[0.08] hover:shadow-[0_20px_40px_-15px_rgba(201,169,110,0.25)]"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] transition-colors duration-300 group-hover:bg-accent/20">
                        <svg className="h-5 w-5 text-white/70 transition-colors duration-300 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-white/90">Позовна заява</p>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-white/40 transition-colors duration-300 group-hover:text-accent/70">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        PDF · 240 KB
                      </div>
                    </a>

                    {/* Card: Скарга */}
                    <a
                      href="/templates/skarga-zrazok.pdf"
                      download
                      className="group rounded-2xl border border-accent-light/15 bg-white/[0.04] p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-white/[0.08] hover:shadow-[0_20px_40px_-15px_rgba(201,169,110,0.25)]"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] transition-colors duration-300 group-hover:bg-accent/20">
                        <svg className="h-5 w-5 text-white/70 transition-colors duration-300 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H6m12 10.5H6a2.25 2.25 0 01-2.25-2.25V6.108c0-1.135.845-2.098 1.976-2.192a48.424 48.424 0 011.123-.08M15.75 18.75a3 3 0 01.954-2.194" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-white/90">Скарга</p>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-white/40 transition-colors duration-300 group-hover:text-accent/70">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        PDF · 180 KB
                      </div>
                    </a>

                    {/* Card: Договір */}
                    <a
                      href="/templates/dogovir-zrazok.pdf"
                      download
                      className="group rounded-2xl border border-accent-light/15 bg-white/[0.04] p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-white/[0.08] hover:shadow-[0_20px_40px_-15px_rgba(201,169,110,0.25)]"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] transition-colors duration-300 group-hover:bg-accent/20">
                        <svg className="h-5 w-5 text-white/70 transition-colors duration-300 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-white/90">Договір</p>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-white/40 transition-colors duration-300 group-hover:text-accent/70">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        PDF · 320 KB
                      </div>
                    </a>

                    {/* Card: Заява до суду */}
                    <a
                      href="/templates/zayava-do-sudu-zrazok.pdf"
                      download
                      className="group rounded-2xl border border-accent-light/15 bg-white/[0.04] p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-white/[0.08] hover:shadow-[0_20px_40px_-15px_rgba(201,169,110,0.25)]"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] transition-colors duration-300 group-hover:bg-accent/20">
                        <svg className="h-5 w-5 text-white/70 transition-colors duration-300 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-white/90">Заява до суду</p>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-white/40 transition-colors duration-300 group-hover:text-accent/70">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        PDF · 280 KB
                      </div>
                    </a>
                  </div>

                  {/* Bottom accent bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 animate-shimmer rounded-b-3xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust Bar (Dark) ── */}
        <section className="relative bg-primary py-7 text-white">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 md:justify-between">
              {darkTrustItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 text-sm text-white/85"
                >
                  <span className="text-accent shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Practice Areas ── */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Спеціалізації
              </p>
              <h2 className="font-display text-3xl font-semibold text-primary sm:text-4xl lg:text-5xl">
                Сфери практики
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-muted">
                Допомагаю в основних галузях українського права — від першої
                консультації до результату в суді
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {practiceAreas.map((area) => (
                <Link
                  key={area.slug}
                  href={`/practices/${area.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_40px_-15px_rgba(201,169,110,0.25)]"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-accent ring-1 ring-accent/30 transition group-hover:bg-accent/10">
                    {area.icon}
                  </div>
                  <h3 className="mb-2 font-display text-xl font-semibold text-primary">
                    {area.title}
                  </h3>
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-muted">
                    {area.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-accent transition group-hover:gap-2.5">
                    Дізнатися більше
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              ))}

              {/* "More" dark card */}
              <Link
                href="/practices"
                className="group flex flex-col rounded-2xl bg-primary p-7 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] sm:col-span-2 lg:col-span-1"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-accent ring-1 ring-accent/40">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z M9 12l2 2 4-4" />
                  </svg>
                </div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                  Ще +12 напрямків
                </p>
                <h3 className="mb-6 font-display text-xl font-semibold leading-tight">
                  Кримінальне, спадкове, адміністративне
                </h3>
                <span className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-primary transition group-hover:bg-accent-hover">
                  Усі спеціалізації
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── How It Works (4 steps) ── */}
        <section id="process" className="bg-surface py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Як працюємо
              </p>
              <h2 className="font-display text-3xl font-semibold text-primary sm:text-4xl lg:text-5xl">
                4 кроки до результату
              </h2>
            </div>

            <div className="relative grid gap-12 lg:grid-cols-4 lg:gap-6">
              {/* Dashed gold line (desktop) */}
              <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[30px] hidden lg:block">
                <svg className="h-px w-full" preserveAspectRatio="none">
                  <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="var(--accent)" strokeOpacity="0.5" strokeDasharray="4 4" />
                </svg>
              </div>

              {processSteps.map((step, idx) => {
                const isLast = idx === processSteps.length - 1;
                return (
                  <div
                    key={step.number}
                    className="relative flex flex-col items-center text-center"
                  >
                    {/* Mobile vertical connector */}
                    {idx < processSteps.length - 1 && (
                      <div className="absolute left-1/2 top-16 h-[calc(100%-4rem)] w-px -translate-x-1/2 border-l border-dashed border-accent/40 lg:hidden" />
                    )}

                    {/* Number circle */}
                    <div
                      className={`relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full font-display text-xl font-bold ring-2 ring-accent ${
                        isLast
                          ? "bg-accent text-primary shadow-[0_0_30px_-5px_rgba(201,169,110,0.6)]"
                          : "bg-surface text-accent"
                      }`}
                    >
                      {step.number}
                    </div>

                    <h3 className="mb-2 font-display text-lg font-semibold text-primary">
                      {step.title}
                    </h3>
                    <p className="max-w-xs text-sm leading-relaxed text-muted">
                      {step.description}
                    </p>
                  </div>
                );
              })}
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
