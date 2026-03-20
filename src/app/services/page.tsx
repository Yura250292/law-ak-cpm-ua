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
        <section className="bg-primary py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              Наші послуги
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              Оберіть потрібний тип юридичного документа. Кожен документ
              підготовлений відповідно до чинного законодавства України.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {templates.length === 0 ? (
              <div className="rounded-2xl border border-border bg-white p-12 text-center">
                <p className="text-lg text-muted">
                  Наразі послуги оновлюються. Будь ласка, зверніться пізніше.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className="flex flex-col transition-shadow duration-200 hover:shadow-lg"
                  >
                    <CardHeader>
                      <div className="mb-2">
                        <span className="inline-block rounded-full bg-accent-light/20 px-3 py-1 text-xs font-medium text-accent">
                          {template.category}
                        </span>
                      </div>
                      <CardTitle>{template.title}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1" />

                    <CardFooter className="flex items-center justify-between">
                      <div className="text-lg font-bold text-primary">
                        {template.price.toLocaleString("uk-UA")} грн
                      </div>
                      <Link href={`/document/${template.slug}`}>
                        <Button>Замовити</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
