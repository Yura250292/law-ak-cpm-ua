import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { SampleIcon } from "@/components/content/SampleIcon";
import { getSamples } from "@/lib/content";

export const metadata: Metadata = {
  title: "Зразки документів — Адвокат Кабаль Анастасія Ігорівна",
  description:
    "Безкоштовні зразки юридичних документів: позовна заява, скарга, договір, заява до суду. Завантажте PDF-шаблони, підготовлені адвокатом у Львові.",
};

export const dynamic = "force-dynamic";

const downloadIcon = (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export default async function SamplesPage() {
  const documentSamples = await getSamples();
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary py-20 text-white">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-accent/[0.06] blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Stagger className="space-y-4" delayChildren={0.1} staggerChildren={0.12}>
              <StaggerItem>
                <h1 className="text-3xl font-bold sm:text-5xl">Зразки документів</h1>
              </StaggerItem>
              <StaggerItem>
                <p className="max-w-2xl text-lg text-white/60">
                  Безкоштовні зразки юридичних документів у форматі PDF. Завантажте
                  для ознайомлення. Для підготовки документа під вашу ситуацію —
                  зверніться за консультацією.
                </p>
              </StaggerItem>
            </Stagger>
          </div>
        </section>

        {/* Samples grid */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Stagger
              className="grid gap-8 sm:grid-cols-2"
              whileInView
              delayChildren={0.1}
              staggerChildren={0.1}
            >
              {documentSamples.map((doc) => (
                <StaggerItem key={doc.id} className="h-full">
                  <a
                    href={doc.fileUrl}
                    download
                    className="group flex h-full flex-col rounded-2xl border border-border bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_40px_-15px_rgba(201,169,110,0.25)]"
                  >
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-accent ring-1 ring-accent/30 transition group-hover:bg-accent/10 group-hover:scale-110">
                      <SampleIcon iconKey={doc.iconKey} />
                    </div>
                    <h2 className="mb-2 font-display text-xl font-semibold text-primary">
                      {doc.title}
                    </h2>
                    <p className="mb-6 flex-1 text-sm leading-relaxed text-muted">
                      {doc.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-accent transition group-hover:gap-3">
                      {downloadIcon}
                      Завантажити · {doc.sizeLabel}
                    </span>
                  </a>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-primary py-24 text-white">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

          <Reveal className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Потрібен документ під вашу ситуацію?
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Зразки — лише для орієнтиру. Замовте індивідуальну підготовку
              документа або запишіться на консультацію, щоб отримати рішення саме
              для вашої справи.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <MagneticButton className="inline-block">
                <Link href="/consultation">
                  <Button className="rounded-xl bg-accent px-10 py-4 text-base font-semibold text-primary shadow-lg shadow-accent/20 transition hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/30">
                    Записатись на консультацію
                  </Button>
                </Link>
              </MagneticButton>
              <Link href="/services">
                <Button className="rounded-xl border-2 border-white bg-transparent px-10 py-4 text-base font-semibold text-white transition hover:bg-white hover:text-primary">
                  Переглянути послуги
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
