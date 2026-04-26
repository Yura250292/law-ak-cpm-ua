import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata = {
  title: "Наші послуги",
  description:
    "Повний каталог юридичних документів: позовні заяви, договори, скарги та інші документи онлайн.",
};

export default async function ServicesPage() {
  const templates = await prisma.documentTemplate.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

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
                  Наші послуги
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="max-w-2xl text-lg text-white/60">
                  Оберіть потрібний тип юридичного документа. Кожен документ
                  підготовлений відповідно до чинного законодавства України.
                </p>
              </StaggerItem>
            </Stagger>
          </div>
        </section>

        {/* Services Grid */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {templates.length === 0 ? (
              <Reveal>
                <div className="rounded-2xl border border-border bg-white p-12 text-center">
                  <p className="text-lg text-muted">
                    Наразі послуги оновлюються. Будь ласка, зверніться пізніше.
                  </p>
                </div>
              </Reveal>
            ) : (
              <Stagger
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                whileInView
                delayChildren={0.05}
                staggerChildren={0.08}
              >
                {templates.map((template) => (
                  <StaggerItem key={template.id} className="h-full">
                  <Card
                    className="flex h-full flex-col rounded-2xl border border-border bg-white transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_40px_-15px_rgba(201,169,110,0.25)]"
                  >
                    <CardHeader>
                      <div className="mb-3">
                        <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                          {template.category}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-bold text-primary">
                        {template.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-sm text-muted">
                        {template.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1" />

                    <CardFooter className="flex items-center justify-between border-t border-border pt-4">
                      <div className="text-lg font-bold text-primary">
                        {template.price.toLocaleString("uk-UA")} грн
                      </div>
                      <Link href={`/document/${template.slug}`}>
                        <Button className="rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:bg-accent/90 hover:shadow-md">
                          Замовити
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
