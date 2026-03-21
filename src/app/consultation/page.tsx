import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ConsultationForm from "@/components/ConsultationForm";

export const metadata: Metadata = {
  title: "Онлайн-консультація",
  description:
    "Запишіться на онлайн-консультацію з адвокатом. Бліц, стандартна або розширена консультація через Zoom, Google Meet або телефон.",
};

const consultationTypes = [
  {
    title: "Бліц-консультація",
    duration: "15 хвилин",
    price: "300 грн",
    description:
      "Швидка відповідь на конкретне юридичне питання. Ідеально для простих ситуацій, коли потрібна базова консультація.",
  },
  {
    title: "Стандартна консультація",
    duration: "30 хвилин",
    price: "500 грн",
    description:
      "Детальний розгляд вашої справи з аналізом документів та рекомендаціями щодо подальших дій.",
  },
  {
    title: "Розширена консультація",
    duration: "60 хвилин",
    price: "900 грн",
    description:
      "Комплексний аналіз складної ситуації з розробкою стратегії захисту та покроковим планом дій.",
  },
];

const benefits = [
  { icon: "clock", title: "Без черг", description: "Консультація у зручний для вас час без очікування." },
  { icon: "globe", title: "З будь-якої точки України", description: "Підключайтесь онлайн з будь-якого міста чи навіть з-за кордону." },
  { icon: "lock", title: "Конфіденційно", description: "Захищений канал зв'язку та адвокатська таємниця." },
  { icon: "mic", title: "Запис розмови за бажанням", description: "За вашим запитом надамо аудіозапис консультації." },
];

const howItWorks = [
  { step: "1", title: "Залишіть заявку", description: "Заповніть форму нижче, обравши зручний час та тип консультації." },
  { step: "2", title: "Підтвердження", description: "Ми зв'яжемося з вами для підтвердження дати та часу, а також надішлемо реквізити для оплати." },
  { step: "3", title: "Консультація", description: "У призначений час підключайтесь через Zoom, Google Meet або отримайте дзвінок на телефон." },
];

function BenefitIcon({ icon }: { icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    clock: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    globe: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9 9 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    lock: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    mic: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
  };
  return <>{icons[icon]}</>;
}

export default function ConsultationPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold sm:text-5xl">Онлайн-консультація</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/60">
              Отримайте професійну юридичну консультацію, не виходячи з дому.
              Zoom, Google Meet або телефонний дзвінок — обирайте зручний формат.
            </p>
          </div>
        </section>

        {/* Consultation types */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
                ТАРИФИ
              </p>
              <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                Оберіть тип консультації
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {consultationTypes.map((ct) => (
                <div
                  key={ct.title}
                  className="group rounded-2xl border border-border bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-4 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-primary">
                    {ct.duration}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-primary">{ct.title}</h3>
                  <p className="mb-6 text-sm leading-relaxed text-muted">{ct.description}</p>
                  <div className="text-2xl font-bold text-primary">
                    {ct.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                Як проходить консультація
              </h2>
              <p className="mt-4 text-lg text-muted">
                Три прості кроки до вирішення вашого питання
              </p>
            </div>

            <div className="relative grid gap-12 lg:grid-cols-3 lg:gap-8">
              <div className="absolute left-[16.67%] right-[16.67%] top-6 hidden h-px border-t-2 border-dashed border-border lg:block" />
              {howItWorks.map((item, idx) => (
                <div key={idx} className="relative flex flex-col items-center text-center">
                  {idx < howItWorks.length - 1 && (
                    <div className="absolute left-1/2 top-12 h-full w-px -translate-x-1/2 border-l-2 border-dashed border-border lg:hidden" />
                  )}
                  <div className="relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-accent">
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-primary">{item.title}</h3>
                  <p className="max-w-xs text-sm leading-relaxed text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Booking form */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
                ЗАПИС
              </p>
              <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                Залишити заявку
              </h2>
            </div>
            <ConsultationForm />
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                Переваги онлайн-консультації
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((b) => (
                <div key={b.title} className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-primary">
                    <BenefitIcon icon={b.icon} />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-primary">{b.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Communication info */}
        <section className="relative overflow-hidden bg-primary py-16 text-white">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold sm:text-4xl">Формат зв&apos;язку</h2>
            <p className="mt-4 text-lg text-white/60">
              Консультації проводяться через Zoom, Google Meet або за телефоном.
              Ви отримаєте посилання чи дзвінок у призначений час. За бажанням
              можемо надати аудіозапис консультації.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              <span className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/80">
                Zoom
              </span>
              <span className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/80">
                Google Meet
              </span>
              <span className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/80">
                Телефон
              </span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
