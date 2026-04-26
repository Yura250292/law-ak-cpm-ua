import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { practiceAreas } from "@/lib/practice-areas";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { MagneticButton } from "@/components/motion/MagneticButton";

export const metadata: Metadata = {
  title: "Спеціалізації — Адвокат Кабаль Анастасія Ігорівна",
  description:
    "Спеціалізації адвоката: сімейне, цивільне, господарське та адміністративне право. Професійний захист ваших прав та інтересів у Львові.",
};

export default function PracticesPage() {
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
                <h1 className="text-3xl font-bold sm:text-5xl">Спеціалізації</h1>
              </StaggerItem>
              <StaggerItem>
                <p className="max-w-2xl text-lg text-white/60">
                  Надаю професійну юридичну допомогу у ключових галузях права.
                  Оберіть напрямок, щоб дізнатися більше про послуги та підхід до
                  вирішення вашої справи.
                </p>
              </StaggerItem>
            </Stagger>
          </div>
        </section>

        {/* Practice Areas Grid */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Stagger
              className="grid gap-8 sm:grid-cols-2"
              whileInView
              delayChildren={0.1}
              staggerChildren={0.1}
            >
              {practiceAreas.map((area) => (
                <StaggerItem key={area.slug} className="h-full">
                <Link
                  href={`/practices/${area.slug}`}
                  className="group block h-full"
                >
                  <Card className="h-full rounded-2xl border border-border bg-white p-0 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_40px_-15px_rgba(201,169,110,0.25)]">
                    <CardHeader className="p-8">
                      {/* Icon */}
                      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-surface">
                        <span className="text-3xl">{area.icon}</span>
                      </div>

                      <CardTitle className="mb-2 text-xl font-bold text-primary">
                        {area.title}
                      </CardTitle>
                      <CardDescription className="mb-5 text-sm leading-relaxed text-muted">
                        {area.shortDescription}
                      </CardDescription>

                      {/* Services preview */}
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

                      {/* Link */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-semibold text-accent">
                          Детальніше
                        </span>
                        <span className="text-sm font-medium text-primary transition group-hover:translate-x-1">
                          &rarr;
                        </span>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
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
              Потрібна юридична допомога?
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Зверніться за консультацією або замовте підготовку юридичного
              документа онлайн. Перший крок до вирішення вашої проблеми —
              найважливіший.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <MagneticButton className="inline-block">
                <Link href="/services">
                  <Button className="rounded-xl bg-accent px-10 py-4 text-base font-semibold text-primary shadow-lg shadow-accent/20 transition hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/30">
                    Замовити документ
                  </Button>
                </Link>
              </MagneticButton>
              <Link href="/about">
                <Button className="rounded-xl border-2 border-white bg-transparent px-10 py-4 text-base font-semibold text-white transition hover:bg-white hover:text-primary">
                  Про адвоката
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
