import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { practiceAreas, getPracticeArea } from "@/lib/practice-areas";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return practiceAreas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const area = getPracticeArea(slug);

  if (!area) {
    return { title: "Спеціалізація не знайдена" };
  }

  return {
    title: `${area.title} — Адвокат Кабаль Анастасія Ігорівна`,
    description: area.shortDescription,
  };
}

export default async function PracticeAreaPage({ params }: PageProps) {
  const { slug } = await params;
  const area = getPracticeArea(slug);

  if (!area) {
    notFound();
  }

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{area.icon}</span>
              <h1 className="text-3xl font-bold sm:text-5xl">{area.title}</h1>
            </div>
            <p className="mt-4 max-w-2xl text-lg text-white/60">
              {area.shortDescription}
            </p>
          </div>
        </section>

        {/* Description */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {area.description.split("\n\n").map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-base leading-relaxed text-muted"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
                ПОСЛУГИ
              </p>
              <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                Що входить у цю спеціалізацію
              </h2>
            </div>

            <div className="mx-auto max-w-4xl">
              <div className="grid gap-4 sm:grid-cols-2">
                {area.services.map((service) => (
                  <div
                    key={service}
                    className="flex items-start gap-3 rounded-xl border border-border bg-white p-5 transition-all duration-200 hover:shadow-md"
                  >
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    <span className="text-sm leading-relaxed text-primary">
                      {service}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Advantages */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                Чому обирають мене
              </h2>
              <p className="mt-4 text-lg text-muted">
                Переваги роботи з адвокатом у сфері {area.title.toLowerCase()}
              </p>
            </div>

            <div className="mx-auto max-w-4xl">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {area.advantages.map((advantage, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
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
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-primary">
                      {advantage}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="bg-surface py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                Як це працює
              </h2>
              <p className="mt-4 text-lg text-muted">
                Етапи роботи над вашою справою
              </p>
            </div>

            <div className="relative grid gap-12 lg:grid-cols-4 lg:gap-8">
              {/* Connecting line (desktop) */}
              <div className="absolute left-[12.5%] right-[12.5%] top-6 hidden h-px border-t-2 border-dashed border-border lg:block" />

              {area.process.map((step, idx) => (
                <div
                  key={step.step}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Connecting line (mobile) */}
                  {idx < area.process.length - 1 && (
                    <div className="absolute left-1/2 top-12 h-full w-px -translate-x-1/2 border-l-2 border-dashed border-border lg:hidden" />
                  )}

                  {/* Number circle */}
                  <div className="relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-accent">
                    {step.step}
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

        {/* CTA */}
        <section className="relative overflow-hidden bg-primary py-24 text-white">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Потрібна допомога з {area.title.toLowerCase()}?
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Зверніться за професійною консультацією або замовте підготовку
              юридичного документа онлайн вже сьогодні.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/services">
                <Button className="rounded-xl bg-accent px-10 py-4 text-base font-semibold text-primary shadow-lg shadow-accent/20 transition hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/30">
                  Замовити документ
                </Button>
              </Link>
              <Link href="/practices">
                <Button className="rounded-xl border-2 border-white bg-transparent px-10 py-4 text-base font-semibold text-white transition hover:bg-white hover:text-primary">
                  Всі спеціалізації
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
