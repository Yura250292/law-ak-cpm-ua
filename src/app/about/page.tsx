import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { LawyerPhoto } from "@/components/LawyerPhoto";
import { getCertificates } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Про адвоката — Кабаль Анастасія Ігорівна",
  description:
    "Адвокат Кабаль Анастасія Ігорівна — випускниця юридичного факультету ЛНУ ім. Івана Франка. Спеціалізація: сімейне, цивільне, господарське та адміністративне право. Львів.",
};

const qualifications = [
  "Магістр права — юридичний факультет ЛНУ імені Івана Франка",
  "Понад 7 років офіційної адвокатської практики",
  "Практика та стажування в органах місцевого самоврядування, прокуратурі, судах різних ланок та адвокатурі",
  "Спеціалізація: сімейне, цивільне, господарське та адміністративне право",
  "Представництво інтересів клієнтів у судах усіх інстанцій",
  "Правова допомога фізичним особам, ФОП та юридичним особам",
];

/** Свідоцтво про право на заняття адвокатською діяльністю */
const certificate = {
  number: "№ 002697",
  issuedAt: "22 березня 2024 року",
  decision: "№ 191 від 01 березня 2024 року",
  authority: "Рада адвокатів Львівської області",
};

const approach = [
  "Індивідуальний підхід до кожної справи",
  "Детальний правовий аналіз ситуації перед початком роботи",
  "Чесна оцінка перспектив справи без необґрунтованих обіцянок",
  "Повна конфіденційність отриманої інформації",
  "Оперативна комунікація та супровід клієнта на всіх етапах",
  "Орієнтація не лише на судовий спір, а й на пошук найефективнішого способу захисту прав клієнта",
];

const values = [
  {
    title: "Конфіденційність",
    description:
      "Вся інформація, отримана під час співпраці, захищається адвокатською таємницею відповідно до законодавства України.",
  },
  {
    title: "Професіоналізм",
    description:
      "Кожна справа опрацьовується з урахуванням актуальної судової практики та вимог законодавства.",
  },
  {
    title: "Чесність",
    description:
      "Клієнт отримує об'єктивну оцінку перспектив справи, можливих ризиків та варіантів її вирішення.",
  },
  {
    title: "Відповідальність",
    description:
      "Всі процесуальні документи та правові позиції готуються з максимальною увагою до деталей.",
  },
  {
    title: "Індивідуальний підхід",
    description:
      "Кожне правове питання потребує окремої стратегії, що враховує конкретні обставини справи та інтереси клієнта.",
  },
];

export default async function AboutPage() {
  const certificates = await getCertificates();
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
                  Кабаль Анастасія Ігорівна
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="max-w-2xl text-lg text-white/60">
                  Адвокат у Львові. Спеціалізація — сімейне, цивільне, господарське
                  та адміністративне право. Випускниця юридичного факультету ЛНУ
                  імені Івана Франка.
                </p>
              </StaggerItem>
            </Stagger>
          </div>
        </section>

        {/* Bio Section */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-12 lg:grid-cols-2">
              {/* Photo */}
              <Reveal>
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface">
                  <LawyerPhoto />
                </div>
              </Reveal>

              {/* Bio Text */}
              <Reveal delay={0.15}>
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-primary">
                    Досвід та кваліфікація
                  </h2>
                  <div className="space-y-4 text-base leading-relaxed text-muted">
                    <p>
                      Мене звати <span className="font-semibold text-primary">Анастасія Кабаль</span> — адвокат
                      із понад 7-річним досвідом роботи у сфері права. У своїй
                      практиці я надаю комплексну правову допомогу фізичним
                      особам, фізичним особам-підприємцям та юридичним особам у
                      справах сімейного, цивільного, господарського та
                      адміністративного права.
                    </p>
                    <p>
                      Цьому передували практика та стажування в органах місцевого
                      самоврядування, прокуратурі, судах різних ланок та
                      адвокатурі. Навчалася на юридичному факультеті Львівського
                      національного університету імені Івана Франка, за освітою —
                      магістр права.
                    </p>
                    <p>
                      Моєю метою є не лише вирішення правового спору, а й пошук
                      найбільш ефективного та економічно доцільного рішення для
                      кожного клієнта. Професійний досвід дозволяє комплексно
                      оцінювати кожну ситуацію, прогнозувати можливі ризики та
                      будувати стратегію захисту, спрямовану на досягнення
                      найкращого результату.
                    </p>
                    <p>
                      У своїй роботі я дотримуюся принципів законності,
                      професійної етики та максимальної відповідальності перед
                      клієнтом. Кожна справа є індивідуальною, тому універсальних
                      рішень не існує — саме тому я детально аналізую всі
                      обставини, документи та можливі варіанти розвитку подій
                      перед наданням рекомендацій.
                    </p>
                  </div>

                  {/* Qualification list with accent dots */}
                  <Stagger
                    className="space-y-3 pt-2"
                    whileInView
                    delayChildren={0.1}
                    staggerChildren={0.07}
                  >
                    {qualifications.map((item) => (
                      <StaggerItem key={item} y={10}>
                        <div className="flex items-start gap-3">
                          <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                          <span className="text-sm leading-relaxed text-primary/80">
                            {item}
                          </span>
                        </div>
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Мій підхід до роботи */}
        <section className="bg-white pb-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-12 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Методика
              </p>
              <h2 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
                Мій підхід до роботи
              </h2>
            </Reveal>

            <Stagger
              className="grid gap-4 sm:grid-cols-2"
              whileInView
              delayChildren={0.1}
              staggerChildren={0.08}
            >
              {approach.map((item) => (
                <StaggerItem key={item} className="h-full">
                  <div className="flex h-full items-start gap-4 rounded-2xl border border-border bg-surface/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-white hover:shadow-[0_20px_40px_-15px_rgba(198,166,103,0.25)]">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 ring-1 ring-accent/30">
                      <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm leading-relaxed text-primary/85">
                      {item}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Принципи роботи */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-12 text-center">
              <h2 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
                Принципи роботи
              </h2>
              <p className="mt-4 text-lg text-muted">
                Цінності, на яких базується моя юридична практика
              </p>
            </Reveal>

            <Stagger
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              whileInView
              delayChildren={0.1}
              staggerChildren={0.1}
            >
              {values.map((value) => (
                <StaggerItem key={value.title} className="h-full">
                  <div className="h-full rounded-2xl border border-border bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_40px_-15px_rgba(201,169,110,0.25)]">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface ring-1 ring-accent/20 transition group-hover:bg-accent/10">
                      <svg
                        className="h-6 w-6 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-primary">
                      {value.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted">
                      {value.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Офіційні відомості */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Свідоцтво про право на заняття адвокатською діяльністю */}
            <Reveal delay={0.15}>
              <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-surface/80 to-white p-8 shadow-[0_30px_70px_-40px_rgba(69,66,75,0.5)] sm:p-10">
                <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
                <span className="pointer-events-none absolute left-5 top-5 h-7 w-7 rounded-tl-lg border-l border-t border-accent/40" />
                <span className="pointer-events-none absolute bottom-5 right-5 h-7 w-7 rounded-br-lg border-b border-r border-accent/40" />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-6 right-6 select-none font-display text-[8rem] font-bold leading-none text-accent/[0.07]"
                >
                  КА
                </span>

                <div className="relative">
                  <div className="mb-6 flex items-center gap-4">
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white text-accent ring-1 ring-accent/30">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z M7 21h10 M12 3v18 M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-accent">
                        Офіційні відомості
                      </p>
                      <h3 className="mt-1 font-display text-xl font-semibold text-primary sm:text-2xl">
                        Право на заняття адвокатською діяльністю
                      </h3>
                    </div>
                  </div>

                  <dl className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
                    <div className="bg-white p-5">
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                        Свідоцтво
                      </dt>
                      <dd className="mt-1.5 font-display text-lg font-semibold text-primary">
                        {certificate.number}
                      </dd>
                    </div>
                    <div className="bg-white p-5">
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                        Дата видачі
                      </dt>
                      <dd className="mt-1.5 font-display text-lg font-semibold text-primary">
                        {certificate.issuedAt}
                      </dd>
                    </div>
                    <div className="bg-white p-5">
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                        Рішення
                      </dt>
                      <dd className="mt-1.5 font-display text-lg font-semibold text-primary">
                        {certificate.decision}
                      </dd>
                    </div>
                    <div className="bg-white p-5">
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                        Орган, що видав
                      </dt>
                      <dd className="mt-1.5 text-base font-semibold leading-snug text-primary">
                        {certificate.authority}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </Reveal>

            {/* Профіль у Єдиному реєстрі адвокатів України */}
            <Reveal delay={0.2}>
              <a
                href="https://erau.unba.org.ua/profile/91726"
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-12 flex items-center gap-4 rounded-2xl border border-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_40px_-15px_rgba(201,169,110,0.25)]"
              >
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-surface text-accent ring-1 ring-accent/30">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z M9 12l2 2 4-4" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-accent">
                    Офіційне підтвердження
                  </p>
                  <p className="mt-1 font-semibold text-primary">
                    Профіль у Єдиному реєстрі адвокатів України
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    Перевірте інформацію про мене на erau.unba.org.ua
                  </p>
                </div>
                <svg className="h-5 w-5 flex-shrink-0 text-accent transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </Reveal>
          </div>
        </section>

        {/* Підвищення кваліфікації */}
        {certificates.length > 0 && (
          <section className="bg-surface py-20">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <Reveal className="mb-10 text-center">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  Кваліфікація
                </p>
                <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                  Підвищення кваліфікації
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base text-muted">
                  Сертифікати та підтвердження проходження навчальних програм і
                  підвищення кваліфікації.
                </p>
              </Reveal>

              <Stagger
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                whileInView
                delayChildren={0.1}
                staggerChildren={0.1}
              >
                {certificates.map((cert) => (
                  <StaggerItem key={cert.id}>
                    <figure className="overflow-hidden rounded-2xl border border-border bg-white transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cert.imageUrl}
                        alt={cert.title}
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <figcaption className="p-4 text-sm font-medium text-primary">
                        {cert.title}
                      </figcaption>
                    </figure>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="rounded-2xl bg-surface p-8 sm:p-12">
                <h2 className="text-center text-3xl font-bold text-primary">
                  Зв&apos;язатися зі мною
                </h2>
                <p className="mt-3 text-center text-muted">
                  Маєте питання або потребуєте консультації? Зверніться зручним для
                  вас способом.
                </p>

                <Stagger
                  className="mt-10 grid gap-6 sm:grid-cols-3"
                  whileInView
                  delayChildren={0.15}
                  staggerChildren={0.1}
                >
                  <StaggerItem>
                    <div className="rounded-xl border border-border bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-md">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                        <svg
                          className="h-5 w-5 text-accent"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                          />
                        </svg>
                      </div>
                      <p className="font-semibold text-primary">Instagram</p>
                      <a
                        href="https://www.instagram.com/k_anastasiya_i/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block text-sm text-muted hover:text-accent transition-colors"
                      >
                        @k_anastasiya_i
                      </a>
                    </div>
                  </StaggerItem>
                  <StaggerItem>
                    <div className="rounded-xl border border-border bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-md">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                        <svg
                          className="h-5 w-5 text-accent"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                          />
                        </svg>
                      </div>
                      <p className="font-semibold text-primary">Телефон</p>
                      <a
                        href="tel:+380956728005"
                        className="mt-1 block text-sm text-muted hover:text-accent transition-colors"
                      >
                        +38 (095) 672-80-05
                      </a>
                    </div>
                  </StaggerItem>
                  <StaggerItem>
                    <div className="rounded-xl border border-border bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-md">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                        <svg
                          className="h-5 w-5 text-accent"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                          />
                        </svg>
                      </div>
                      <p className="font-semibold text-primary">Місто</p>
                      <p className="mt-1 text-sm text-muted">м. Львів, Україна</p>
                    </div>
                  </StaggerItem>
                </Stagger>

                <div className="mt-10 text-center">
                  <MagneticButton className="inline-block">
                    <Link href="/services">
                      <Button className="rounded-xl bg-accent px-8 py-3 font-semibold text-primary transition-all duration-200 hover:bg-accent/90 hover:shadow-lg">
                        Переглянути послуги
                      </Button>
                    </Link>
                  </MagneticButton>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
