import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export const revalidate = 60;

const services = [
  {
    emoji: "💔",
    title: "Розірвання шлюбу",
    description:
      "Підготовка позовної заяви про розірвання шлюбу з урахуванням усіх обставин справи.",
    slug: "rozirvannya-shlyubu",
  },
  {
    emoji: "👶",
    title: "Стягнення аліментів",
    description:
      "Документи для стягнення аліментів на утримання дитини або іншого члена сім'ї.",
    slug: "styagnennya-alimentiv",
  },
  {
    emoji: "⚖️",
    title: "Відшкодування шкоди",
    description:
      "Позовна заява про відшкодування матеріальної або моральної шкоди.",
    slug: "vidshkoduvannya-shkody",
  },
];

const steps = [
  {
    number: "01",
    title: "Оберіть документ",
    description:
      "Виберіть тип юридичного документа з нашого каталогу послуг.",
  },
  {
    number: "02",
    title: "Заповніть форму",
    description:
      "Вкажіть необхідні дані: інформацію про сторони, обставини справи та вимоги.",
  },
  {
    number: "03",
    title: "Отримайте документ",
    description:
      "Після оплати отримайте готовий юридичний документ у форматі PDF на вашу пошту.",
  },
];

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  Юридичні документи онлайн
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">
                  Професійна підготовка юридичних документів за допомогою
                  штучного інтелекту. Швидко, зручно та доступно — без черг
                  та зайвих витрат.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/services">
                    <Button>Переглянути послуги</Button>
                  </Link>
                  <Link href="/about">
                    <Button>Про юриста</Button>
                  </Link>
                </div>
              </div>

              {/* Hero Image Placeholder */}
              <div className="flex items-center justify-center rounded-2xl bg-surface-dark p-12 lg:p-16">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-4xl">📄</span>
                  </div>
                  <p className="text-lg font-medium text-muted">Hero Image</p>
                  <p className="text-sm text-muted/60">1200 x 600</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Preview Section */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                Наші послуги
              </h2>
              <p className="mt-4 text-lg text-muted">
                Оберіть потрібний тип документа і отримайте його за лічені
                хвилини
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/document/${service.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-shadow duration-200 group-hover:shadow-lg">
                    <CardHeader>
                      <span className="mb-3 block text-4xl">
                        {service.emoji}
                      </span>
                      <CardTitle>{service.title}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/services">
                <Button>Усі послуги</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                Як це працює
              </h2>
              <p className="mt-4 text-lg text-muted">
                Три прості кроки до готового юридичного документа
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="relative rounded-2xl border border-border bg-white p-8 text-center"
                >
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-xl font-bold text-white">
                    {step.number}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-primary">
                    {step.title}
                  </h3>
                  <p className="text-muted">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-20 text-white">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold sm:text-4xl">Готові почати?</h2>
            <p className="mt-4 text-lg text-white/80">
              Оберіть необхідний документ та отримайте його вже сьогодні.
              Професійна юридична допомога — на відстані одного кліку.
            </p>
            <div className="mt-8">
              <Link href="/services">
                <Button>Замовити документ</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
