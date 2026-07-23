import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { ReviewsSection } from "@/components/ReviewsSection";
import { FAQSection } from "@/components/FAQSection";
import { LawyerPhoto } from "@/components/LawyerPhoto";
import { generalFAQ } from "@/lib/faq-data";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Counter } from "@/components/motion/Counter";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { HeroBackdrop } from "@/components/motion/HeroBackdrop";
import { ShimmerText } from "@/components/motion/ShimmerText";

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
    count: 100,
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

const heroPromises = [
  "Оцінимо перспективи вашої справи",
  "Запропонуємо покроковий план дій",
  "Повна конфіденційність — адвокатська таємниця",
];

const aboutHighlights = [
  "Понад 7 років досвіду в юридичній сфері",
  "Спеціалізація: сімейне, цивільне, господарське та адміністративне право",
  "Представництво інтересів клієнтів у судах усіх інстанцій",
  "Індивідуальний підхід та повна конфіденційність кожної справи",
];

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="relative bg-white overflow-hidden">
          <HeroBackdrop />
          <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8 lg:py-32">
            <Stagger className="space-y-8" delayChildren={0.15} staggerChildren={0.14}>
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
        </section>

        {/* ── Trust Bar (Dark) ── */}
        <section className="relative bg-primary py-7 text-white">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Stagger
              className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 md:justify-between"
              whileInView
              delayChildren={0}
              staggerChildren={0.08}
            >
              {darkTrustItems.map((item) => (
                <StaggerItem key={item.label} y={10}>
                  <div className="flex items-center gap-3 text-sm text-white/85">
                    <span className="text-accent shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── About the Lawyer ── */}
        <section id="about" className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Photo */}
              <Reveal y={32} className="relative">
                <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl bg-surface shadow-[0_30px_80px_-30px_rgba(0,0,0,0.4)] ring-1 ring-accent/20">
                  <LawyerPhoto />
                  {/* Accent frame accents */}
                  <span className="pointer-events-none absolute left-4 top-4 h-2 w-2 rounded-full bg-accent/50 ring-1 ring-accent/30" />
                  <span className="pointer-events-none absolute right-4 top-4 h-2 w-2 rounded-full bg-accent/50 ring-1 ring-accent/30" />
                  <span className="pointer-events-none absolute bottom-4 left-4 h-2 w-2 rounded-full bg-accent/50 ring-1 ring-accent/30" />
                  <span className="pointer-events-none absolute bottom-4 right-4 h-2 w-2 rounded-full bg-accent/50 ring-1 ring-accent/30" />
                </div>
                {/* Floating experience badge */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-2xl bg-primary px-6 py-3 text-center text-white shadow-lg shadow-primary/25 ring-1 ring-accent/30">
                  <span className="block font-display text-2xl font-bold text-accent">7+</span>
                  <span className="text-[11px] uppercase tracking-[0.15em] text-white/70">
                    років досвіду
                  </span>
                </div>
              </Reveal>

              {/* Text */}
              <Reveal delay={0.15} y={32}>
                <div className="space-y-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                    Про адвоката
                  </p>
                  <h2 className="font-display text-3xl font-semibold text-primary sm:text-4xl lg:text-5xl">
                    Кабаль Анастасія Ігорівна
                  </h2>
                  <div className="space-y-4 text-base leading-relaxed text-muted">
                    <p>
                      Адвокат зі Львова з понад 7-річним досвідом роботи в
                      юридичній сфері. Спеціалізуюся на сімейному, цивільному,
                      господарському та адміністративному праві — від першої
                      консультації до результату в суді.
                    </p>
                    <p>
                      Допомагаю клієнтам захищати їхні права: готую позовні заяви,
                      скарги та договори, представляю інтереси в судах усіх
                      інстанцій. Працюю особисто у Львові та онлайн по всій Україні.
                    </p>
                  </div>

                  <Stagger
                    className="space-y-3 pt-2"
                    whileInView
                    delayChildren={0.1}
                    staggerChildren={0.08}
                  >
                    {aboutHighlights.map((item) => (
                      <StaggerItem key={item} y={10}>
                        <div className="flex items-start gap-3">
                          <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                            <svg className="h-3 w-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span className="text-sm leading-relaxed text-primary/80">
                            {item}
                          </span>
                        </div>
                      </StaggerItem>
                    ))}
                  </Stagger>

                  <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                    <MagneticButton className="w-full sm:w-auto">
                      <Link href="/about" className="block w-full sm:w-auto">
                        <Button className="w-full sm:w-auto rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-light hover:shadow-xl">
                          Дізнатися більше
                        </Button>
                      </Link>
                    </MagneticButton>
                    <Link href="/consultation" className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto rounded-xl border-2 border-primary bg-transparent px-8 py-3 text-base font-semibold text-primary transition hover:bg-primary hover:text-white">
                        Записатися на консультацію
                      </Button>
                    </Link>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Practice Areas ── */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-16 text-center">
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
            </Reveal>

            <Stagger
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
              whileInView
              delayChildren={0.1}
              staggerChildren={0.1}
            >
              {practiceAreas.map((area) => (
                <StaggerItem key={area.slug} className="h-full">
                  <Link
                    href={`/practices/${area.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-border bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_40px_-15px_rgba(201,169,110,0.25)]"
                  >
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-accent ring-1 ring-accent/30 transition group-hover:bg-accent/10 group-hover:scale-110">
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
                </StaggerItem>
              ))}

              {/* "More" dark card */}
              <StaggerItem className="h-full sm:col-span-2 lg:col-span-1">
                <Link
                  href="/services"
                  className="group flex h-full flex-col rounded-2xl bg-primary p-7 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-accent ring-1 ring-accent/40 transition group-hover:scale-110">
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
              </StaggerItem>
            </Stagger>
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
