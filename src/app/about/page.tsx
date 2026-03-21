import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export const revalidate = 60;

export const metadata = {
  title: "Про адвоката — Кабаль Анастасія Ігорівна",
  description:
    "Адвокат Кабаль Анастасія Ігорівна — випускниця юридичного факультету ЛНУ ім. Івана Франка. Спеціалізація: сімейне, цивільне, господарське та адміністративне право. Львів.",
};

const qualifications = [
  "Випускниця юридичного факультету ЛНУ імені Івана Франка",
  "Спеціалізація на сімейному, цивільному, господарському та адміністративному праві",
  "Понад 20 успішно проведених судових справ",
  "Представництво інтересів клієнтів у судах усіх інстанцій",
  "Впровадження сучасних технологій у юридичну практику",
  "Підготовка юридичних документів відповідно до чинного законодавства",
];

const values = [
  {
    title: "Індивідуальний підхід",
    description:
      "Кожна справа розглядається з урахуванням усіх обставин та особливостей конкретної ситуації клієнта.",
  },
  {
    title: "Прозорість",
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
        <section className="bg-primary py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold sm:text-5xl">
              Кабаль Анастасія Ігорівна
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/60">
              Адвокат у Львові. Спеціалізація — сімейне, цивільне, господарське
              та адміністративне право. Випускниця юридичного факультету ЛНУ
              імені Івана Франка.
            </p>
          </div>
        </section>

        {/* Bio Section */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-12 lg:grid-cols-2">
              {/* Photo Placeholder */}
              <div className="flex aspect-square items-center justify-center rounded-2xl bg-surface">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
                    <svg
                      className="h-10 w-10 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-muted">
                    Фото адвоката
                  </p>
                </div>
              </div>

              {/* Bio Text */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-primary">
                  Досвід та кваліфікація
                </h2>
                <div className="space-y-4 text-base leading-relaxed text-muted">
                  <p>
                    Мене звати Анастасія Кабаль — я адвокат зі Львова,
                    випускниця юридичного факультету Львівського національного
                    університету імені Івана Франка. Спеціалізуюся на сімейному,
                    цивільному, господарському та адміністративному праві.
                  </p>
                  <p>
                    За час практики успішно провела понад 20 судових справ —
                    від розірвання шлюбу та стягнення аліментів до
                    відшкодування шкоди та господарських спорів. Надаю
                    професійну допомогу у підготовці юридичних документів та
                    представництві інтересів клієнтів у судах усіх інстанцій.
                  </p>
                  <p>
                    Впроваджую сучасні технології у юридичну практику, щоб
                    зробити правову допомогу швидшою та доступнішою для кожного
                    громадянина України.
                  </p>
                </div>

                {/* Qualification list with accent dots */}
                <ul className="space-y-3 pt-2">
                  {qualifications.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                      <span className="text-sm leading-relaxed text-primary/80">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
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

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="rounded-2xl border border-border bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface">
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
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-surface p-8 sm:p-12">
              <h2 className="text-center text-3xl font-bold text-primary">
                Зв&apos;язатися зі мною
              </h2>
              <p className="mt-3 text-center text-muted">
                Маєте питання або потребуєте консультації? Зверніться зручним для
                вас способом.
              </p>

              <div className="mt-10 grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-white p-6 text-center">
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
                <div className="rounded-xl border border-border bg-white p-6 text-center">
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
                <div className="rounded-xl border border-border bg-white p-6 text-center">
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
              </div>

              <div className="mt-10 text-center">
                <Link href="/services">
                  <Button className="rounded-xl bg-accent px-8 py-3 font-semibold text-primary transition-all duration-200 hover:bg-accent/90 hover:shadow-lg">
                    Переглянути послуги
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
