import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getPracticeAreas } from "@/lib/content";
import { serviceAreas, priceGroups } from "@/lib/services-data";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Послуги та вартість — Адвокат Кабаль Анастасія Ігорівна",
  description:
    "Юридичні послуги адвоката у Львові: сімейне, цивільне, господарське та адміністративне право. Консультації, підготовка документів, представництво в суді.",
};

export default async function ServicesPage() {
  const practiceAreas = await getPracticeAreas();
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="relative overflow-hidden bg-primary py-16 text-white">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-accent/[0.06] blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Stagger className="space-y-4" delayChildren={0.1} staggerChildren={0.12}>
              <StaggerItem>
                <h1 className="text-3xl font-bold sm:text-5xl">
                  Послуги та вартість
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="max-w-2xl text-lg text-white/60">
                  Професійна юридична допомога у ключових галузях права — від
                  першої консультації до результату в суді.
                </p>
              </StaggerItem>
            </Stagger>
          </div>
        </section>

        {/* Спеціалізації (сфери практики) */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-12 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Спеціалізації
              </p>
              <h2 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
                Сфери практики
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-muted">
                Надаю професійну юридичну допомогу у ключових галузях права — від
                консультації до представництва у суді. Оберіть напрямок, щоб
                дізнатися більше.
              </p>
            </Reveal>

            <Stagger
              className="grid gap-8 sm:grid-cols-2"
              whileInView
              delayChildren={0.1}
              staggerChildren={0.1}
            >
              {practiceAreas.map((area) => (
                <StaggerItem key={area.slug} className="h-full">
                  <Link href={`/practices/${area.slug}`} className="group block h-full">
                    <div className="h-full rounded-2xl border border-border bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_40px_-15px_rgba(198,166,103,0.25)]">
                      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-surface text-3xl">
                        {area.icon}
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-primary">
                        {area.title}
                      </h3>
                      <p className="mb-5 text-sm leading-relaxed text-muted">
                        {area.shortDescription}
                      </p>
                      <div className="mb-5 flex flex-wrap gap-2">
                        {area.services.slice(0, 3).map((service) => (
                          <span
                            key={service}
                            className="inline-block rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted"
                          >
                            {service}
                          </span>
                        ))}
                        {area.services.length > 3 && (
                          <span className="inline-block rounded-full bg-surface px-3 py-1 text-xs font-medium text-accent">
                            +{area.services.length - 3} послуг
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition group-hover:gap-2.5">
                        Детальніше
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Послуги у сферах права — детальні переліки */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Stagger
              className="grid gap-6 lg:grid-cols-2"
              whileInView
              delayChildren={0.1}
              staggerChildren={0.12}
            >
              {serviceAreas.map((area) => (
                <StaggerItem key={area.id} className="h-full">
                  <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white p-8 transition-all duration-300 hover:border-accent/40 hover:shadow-[0_28px_60px_-30px_rgba(198,166,103,0.35)]">
                    <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -top-4 right-5 select-none font-display text-[5.5rem] font-bold leading-none text-accent/[0.09]"
                    >
                      {area.number}
                    </span>

                    <div className="relative mb-5">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                        Напрямок {area.number}
                      </p>
                      <h3 className="font-display text-2xl font-semibold text-primary">
                        {area.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted">
                        {area.description}
                      </p>
                    </div>

                    <ul className="relative mt-2 grid flex-1 gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {area.services.map((service) => (
                        <li key={service} className="flex items-start gap-2.5">
                          <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                          <span className="text-sm leading-snug text-primary/80">
                            {service}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={`/practices/${area.id}`}
                      className="group relative mt-7 inline-flex items-center gap-1.5 text-sm font-bold text-accent transition-all"
                    >
                      Детальніше про напрямок
                      <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Вартість послуг */}
        <section className="relative overflow-hidden bg-primary py-20 text-white">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-accent/[0.06] blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-14 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Прайс
              </p>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                Вартість послуг
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-white/60">
                Орієнтовні ціни на основні види правничої допомоги. Остаточна
                вартість завжди узгоджується до початку співпраці.
              </p>
            </Reveal>

            <Stagger
              className="grid gap-6 lg:grid-cols-2"
              whileInView
              delayChildren={0.1}
              staggerChildren={0.1}
            >
              {priceGroups.map((group) => (
                <StaggerItem key={group.title} className="h-full">
                  <div className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition-all duration-300 hover:border-accent/30 hover:bg-white/[0.06]">
                    <h3 className="mb-5 flex items-center gap-3 font-display text-lg font-semibold">
                      <span className="h-px w-6 bg-accent" />
                      {group.title}
                    </h3>
                    <ul className="divide-y divide-white/10">
                      {group.items.map((item) => (
                        <li
                          key={item.service}
                          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3.5"
                        >
                          <span
                            className={`text-sm ${
                              item.featured
                                ? "font-semibold text-white"
                                : "text-white/75"
                            }`}
                          >
                            {item.service}
                          </span>
                          <span
                            className={`whitespace-nowrap text-sm font-semibold ${
                              item.featured ? "text-accent" : "text-white/90"
                            }`}
                          >
                            {item.price}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal delay={0.2}>
              <div className="mt-10 rounded-2xl border-l-2 border-accent bg-white/[0.04] px-7 py-6">
                <p className="text-sm leading-relaxed text-white/70">
                  Вартість правничої допомоги визначається індивідуально після
                  аналізу обставин справи, обсягу необхідної роботи, складності
                  правового питання та наданих документів.{" "}
                  <span className="font-semibold text-white">
                    Остаточна вартість узгоджується з клієнтом до початку
                    співпраці.
                  </span>
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="mt-10 text-center">
                <Link
                  href="/consultation"
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-primary shadow-lg shadow-accent/20 transition-all duration-200 hover:bg-accent-hover hover:shadow-xl active:scale-[0.98]"
                >
                  Записатись на консультацію
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
