import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { ReviewsSection } from "@/components/ReviewsSection";
import { FAQCategorized } from "@/components/FAQCategorized";
import { homeFAQCategories } from "@/lib/faq-data";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Counter } from "@/components/motion/Counter";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { HeroBackdrop } from "@/components/motion/HeroBackdrop";
import { ShimmerText } from "@/components/motion/ShimmerText";

export const revalidate = 60;

const processSteps = [
  {
    number: "01",
    title: "Залишите заявку",
    description: "Опишіть ситуацію коротко у формі або месенджері.",
  },
  {
    number: "02",
    title: "Консультація",
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
    count: 7,
    suffix: "+",
    title: "років",
    subtitle: "практики",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3" />
      </svg>
    ),
  },
  {
    count: 50,
    suffix: "+",
    title: "справ",
    subtitle: "доведено до перемоги",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z M7 21h10 M12 3v18 M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
      </svg>
    ),
  },
  {
    count: 100,
    suffix: "%",
    title: "конфіденційність",
    subtitle: "адвокатська таємниця",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

const heroPromises = [
  "Оцінимо перспективи вашої справи",
  "Запропонуємо покроковий план дій",
  "Повна конфіденційність — адвокатська таємниця",
];

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="relative bg-white overflow-hidden">
          <HeroBackdrop />
          <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
            {/* Warm content panel — brand backdrop under the hero copy */}
            <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-gradient-to-b from-white/95 via-surface/70 to-white/95 px-5 py-12 text-center shadow-[0_40px_100px_-45px_rgba(69,66,75,0.45)] backdrop-blur-sm sm:px-10 sm:py-16 lg:px-16">
              {/* gold hairlines top & bottom */}
              <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
              <span className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
              {/* corner brackets */}
              <span className="pointer-events-none absolute left-5 top-5 h-8 w-8 rounded-tl-xl border-l border-t border-accent/40 sm:left-7 sm:top-7" />
              <span className="pointer-events-none absolute right-5 top-5 h-8 w-8 rounded-tr-xl border-r border-t border-accent/40 sm:right-7 sm:top-7" />
              <span className="pointer-events-none absolute bottom-5 left-5 h-8 w-8 rounded-bl-xl border-b border-l border-accent/40 sm:bottom-7 sm:left-7" />
              <span className="pointer-events-none absolute bottom-5 right-5 h-8 w-8 rounded-br-xl border-b border-r border-accent/40 sm:bottom-7 sm:right-7" />
              {/* soft gold glow behind the heading */}
              <span className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] max-w-full -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/10 blur-3xl" />
              {/* monogram watermark */}
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-2 right-6 select-none font-display text-[9rem] font-bold leading-none text-accent/[0.07] sm:text-[12rem]"
              >
                КА
              </span>

              <Stagger className="relative space-y-8" delayChildren={0.15} staggerChildren={0.14}>
              {/* Eyebrow badge with golden dot */}
              <StaggerItem>
                <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
                  <span className="h-2 w-2 rounded-full bg-accent animate-gentle-pulse" />
                  Адвокат · Львів · Онлайн по Україні
                </span>
              </StaggerItem>

              {/* Heading */}
              <StaggerItem>
                <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight text-primary lg:text-6xl">
                  Юридичний захист,
                  <br />
                  якому <ShimmerText>довіряють</ShimmerText>
                </h1>
              </StaggerItem>

              {/* Subtitle */}
              <StaggerItem>
                <div className="mx-auto max-w-2xl space-y-4 text-lg leading-relaxed text-muted">
                  <p className="font-semibold text-primary">
                    Понад 7 років юридичної практики.
                  </p>
                  <p>
                    Надаю кваліфіковану правову допомогу у справах сімейного,
                    цивільного, господарського та адміністративного права.
                    Супроводжую клієнтів на всіх етапах вирішення правових питань —
                    від консультації до представництва інтересів у суді.
                  </p>
                  <p>
                    Підготовка позовних заяв, процесуальних документів, договорів
                    та інших юридичних документів. Консультації проводяться як
                    особисто у Львові, так і онлайн для клієнтів з усієї України.
                  </p>
                </div>
              </StaggerItem>

              {/* Buttons */}
              <StaggerItem>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <MagneticButton className="w-full sm:w-auto">
                    <Link href="/consultation" className="block w-full sm:w-auto">
                      <Button className="group w-full sm:w-auto rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-light hover:shadow-xl">
                        <span>Записатись на консультацію</span>
                        <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </Link>
                  </MagneticButton>
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
              </StaggerItem>

              {/* Hero trust signals */}
              <StaggerItem>
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
                  {heroTrustSignals.map((signal) => (
                    <div key={signal.title} className="flex items-center justify-center gap-3 sm:justify-start">
                      <span className="text-accent shrink-0">{signal.icon}</span>
                      <div className="flex flex-col text-left leading-tight">
                        <span className="text-sm font-bold text-primary">
                          <Counter to={signal.count} suffix={signal.suffix} /> {signal.title}
                        </span>
                        <span className="text-xs text-muted">
                          {signal.subtitle}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </StaggerItem>

              {/* Promises checklist */}
              <StaggerItem>
                <ul className="mx-auto flex max-w-2xl flex-col gap-3 pt-2 text-left sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6">
                  {heroPromises.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/15">
                        <svg className="h-3 w-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-sm leading-relaxed text-primary/80">{item}</span>
                    </li>
                  ))}
                </ul>
                </StaggerItem>
              </Stagger>
            </div>
          </div>
        </section>

        {/* ── How It Works (4 steps) ── */}
        <section id="process" className="bg-surface py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-16 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Як працюємо
              </p>
              <h2 className="font-display text-3xl font-semibold text-primary sm:text-4xl lg:text-5xl">
                4 кроки до результату
              </h2>
            </Reveal>

            <div className="relative">
              {/* Dashed gold line (desktop) */}
              <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[30px] hidden lg:block">
                <svg className="h-px w-full" preserveAspectRatio="none">
                  <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="var(--accent)" strokeOpacity="0.5" strokeDasharray="4 4" />
                </svg>
              </div>

              <Stagger
                className="relative grid gap-12 lg:grid-cols-4 lg:gap-6"
                whileInView
                delayChildren={0.15}
                staggerChildren={0.18}
              >
                {processSteps.map((step, idx) => {
                  const isLast = idx === processSteps.length - 1;
                  return (
                    <StaggerItem key={step.number}>
                      <div className="relative flex flex-col items-center text-center">
                        {/* Mobile vertical connector */}
                        {idx < processSteps.length - 1 && (
                          <div className="absolute left-1/2 top-16 h-[calc(100%-4rem)] w-px -translate-x-1/2 border-l border-dashed border-accent/40 lg:hidden" />
                        )}

                        {/* Number circle */}
                        <div
                          className={`relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full font-display text-xl font-bold ring-2 ring-accent transition-transform duration-300 hover:scale-110 ${
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
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </div>
          </div>
        </section>

        {/* ── Reviews Section ── */}
        <ReviewsSection />

        {/* ── FAQ Section ── */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-12 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                FAQ
              </p>
              <h2 className="font-display text-3xl font-semibold text-primary sm:text-4xl lg:text-5xl">
                Часті запитання
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-muted">
                Відповіді на найпоширеніші питання про співпрацю, судові справи,
                сімейні спори та юридичний супровід бізнесу
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <FAQCategorized categories={homeFAQCategories} />
            </Reveal>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="relative overflow-hidden bg-primary py-24 text-white">
          {/* Subtle accent glow */}
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

          <Reveal className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold sm:text-4xl">Готові почати?</h2>
            <p className="mt-4 text-lg text-white/60">
              Оберіть необхідний документ та отримайте його вже сьогодні.
              Професійна юридична допомога — на відстані одного кліку.
            </p>
            <div className="mt-10">
              <MagneticButton className="inline-block">
                <Link href="/consultation">
                  <Button className="rounded-xl bg-accent px-10 py-4 text-base font-semibold text-primary shadow-lg shadow-accent/20 transition hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/30">
                    Записатись на консультацію
                  </Button>
                </Link>
              </MagneticButton>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </>
  );
}
