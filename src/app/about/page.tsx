import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export const revalidate = 60;

export const metadata = {
  title: "Про юриста",
  description:
    "Дізнайтеся більше про досвід та підхід нашого юриста до вирішення правових питань.",
};

const values = [
  {
    title: "Індивідуальний підхід",
    description:
      "Кожна справа розглядається з урахуванням усіх обставин та особливостей конкретної ситуації клієнта.",
  },
  {
    title: "Прозорість та чесність",
    description:
      "Відкрита комунікація щодо перспектив справи, термінів та вартості послуг без прихованих платежів.",
  },
  {
    title: "Доступність",
    description:
      "Завдяки сучасним технологіям юридична допомога стає доступною кожному, незалежно від місця проживання.",
  },
  {
    title: "Результативність",
    description:
      "Орієнтація на досягнення конкретного результату для клієнта з використанням усіх законних засобів.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              Про юриста
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              Професійна юридична допомога з багаторічним досвідом у сімейному,
              цивільному та господарському праві.
            </p>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-12 lg:grid-cols-2">
              {/* Photo Placeholder */}
              <div className="flex items-center justify-center rounded-2xl bg-surface-dark p-16">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-5xl">👤</span>
                  </div>
                  <p className="text-lg font-medium text-muted">
                    Фото юриста
                  </p>
                  <p className="text-sm text-muted/60">
                    Буде додано пізніше
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-primary">
                  Досвід та кваліфікація
                </h2>
                <div className="space-y-4 text-lg leading-relaxed text-foreground/80">
                  <p>
                    Маю багаторічний досвід роботи у сфері юридичних послуг.
                    Спеціалізуюся на сімейному, цивільному та господарському
                    праві. Надаю професійну допомогу у підготовці юридичних
                    документів та представництві інтересів клієнтів у суді.
                  </p>
                  <p>
                    Вища юридична освіта, постійне підвищення кваліфікації та
                    відстеження змін у законодавстві дозволяють надавати якісні
                    юридичні послуги на найвищому рівні.
                  </p>
                  <p>
                    Впроваджую сучасні технології у юридичну практику, щоб
                    зробити правову допомогу швидшою та доступнішою для кожного
                    громадянина України.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                Принципи роботи
              </h2>
              <p className="mt-4 text-lg text-muted">
                Цінності, на яких базується моя юридична практика
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="rounded-2xl border border-border bg-white p-8"
                >
                  <h3 className="mb-3 text-xl font-semibold text-primary">
                    {value.title}
                  </h3>
                  <p className="leading-relaxed text-muted">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-primary sm:text-4xl">
              Зв&apos;язатися зі мною
            </h2>
            <p className="mt-4 text-lg text-muted">
              Маєте питання або потребуєте консультації? Зверніться зручним для
              вас способом.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-surface p-6">
                <span className="mb-3 block text-3xl">📧</span>
                <p className="font-medium text-primary">Email</p>
                <p className="mt-1 text-sm text-muted">info@example.com</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-6">
                <span className="mb-3 block text-3xl">📞</span>
                <p className="font-medium text-primary">Телефон</p>
                <p className="mt-1 text-sm text-muted">+380 XX XXX XX XX</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-6">
                <span className="mb-3 block text-3xl">📍</span>
                <p className="font-medium text-primary">Адреса</p>
                <p className="mt-1 text-sm text-muted">м. Київ, Україна</p>
              </div>
            </div>

            <div className="mt-10">
              <Link href="/services">
                <Button>Переглянути послуги</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
