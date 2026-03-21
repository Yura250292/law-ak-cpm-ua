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
        <section className="bg-primary py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold sm:text-5xl">Спеціалізації</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/60">
              Надаю професійну юридичну допомогу у ключових галузях права.
              Оберіть напрямок, щоб дізнатися більше про послуги та підхід до
              вирішення вашої справи.
            </p>
          </div>
        </section>

        {/* Practice Areas Grid */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2">
              {practiceAreas.map((area) => (
                <Link
                  key={area.slug}
                  href={`/practices/${area.slug}`}
                  className="group"
                >
                  <Card className="h-full rounded-2xl border border-border bg-white p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
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
              Потрібна юридична допомога?
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Зверніться за консультацією або замовте підготовку юридичного
              документа онлайн. Перший крок до вирішення вашої проблеми —
              найважливіший.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/services">
                <Button className="rounded-xl bg-accent px-10 py-4 text-base font-semibold text-primary shadow-lg shadow-accent/20 transition hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/30">
                  Замовити документ
                </Button>
              </Link>
              <Link href="/about">
                <Button className="rounded-xl border-2 border-white bg-transparent px-10 py-4 text-base font-semibold text-white transition hover:bg-white hover:text-primary">
                  Про адвоката
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
