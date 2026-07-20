import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export const metadata = {
  title: "Зв'язатися з адвокатом — Кабаль Анастасія Ігорівна",
  description:
    "Зв'яжіться з адвокатом Кабаль Анастасією Ігорівною у Львові. Консультація, складання документів, представництво в суді. Телефон: +380956728005.",
};

export default function ContactPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary py-20 text-white">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-accent/[0.06] blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Stagger className="space-y-4" delayChildren={0.1} staggerChildren={0.12}>
              <StaggerItem>
                <h1 className="text-3xl font-bold sm:text-5xl">
                  Зв&apos;язатися з адвокатом
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="max-w-2xl text-lg text-white/60">
                  Маєте юридичне питання? Заповніть форму нижче або зверніться
                  зручним для вас способом. Відповідь протягом 24 годин.
                </p>
              </StaggerItem>
            </Stagger>
          </div>
        </section>

        {/* Form + Info Section */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-3">
              {/* Contact Form */}
              <Reveal className="lg:col-span-2">
                <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
                  <h2 className="mb-6 text-2xl font-bold text-primary">
                    Напишіть мені
                  </h2>
                  <ContactForm />
                </div>
              </Reveal>

              {/* Contact Info Sidebar */}
              <Stagger
                className="space-y-6"
                whileInView
                delayChildren={0.2}
                staggerChildren={0.1}
              >
                {/* Instagram */}
                <StaggerItem>
                <div className="rounded-xl border border-border bg-white p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md">
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
                    className="mt-1 block text-sm text-muted transition-colors hover:text-accent"
                  >
                    @k_anastasiya_i
                  </a>
                </div>
                </StaggerItem>

                {/* Phone */}
                <StaggerItem>
                <div className="rounded-xl border border-border bg-white p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md">
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
                    className="mt-1 block text-sm text-muted transition-colors hover:text-accent"
                  >
                    +38 (095) 67-28-005
                  </a>
                </div>
                </StaggerItem>

                {/* Email */}
                <StaggerItem>
                <div className="rounded-xl border border-border bg-white p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md">
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
                  <p className="font-semibold text-primary">Email</p>
                  <a
                    href="mailto:advocate.kabal.a@gmail.com"
                    className="mt-1 block break-all text-sm text-muted transition-colors hover:text-accent"
                  >
                    advocate.kabal.a@gmail.com
                  </a>
                </div>
                </StaggerItem>

                {/* Location */}
                <StaggerItem>
                <div className="rounded-xl border border-border bg-white p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md">
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
                  <p className="font-semibold text-primary">Адреса</p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Львів%2C+вул.+Федьковича%2C+58"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-sm text-muted transition-colors hover:text-accent"
                  >
                    м. Львів, вул. Федьковича, 58, літ. А-5
                  </a>
                </div>
                </StaggerItem>
              </Stagger>
            </div>
          </div>
        </section>

        {/* Google Maps Section */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                Місцезнаходження
              </h2>
              <p className="mt-3 text-muted">
                м. Львів, вул. Федьковича, 58, літ. А-5
              </p>
            </Reveal>
            <Reveal delay={0.1} className="overflow-hidden rounded-2xl border border-border shadow-sm">
              <iframe
                title="м. Львів, вул. Федьковича, 58 — місцезнаходження адвоката"
                src="https://maps.google.com/maps?q=%D0%9B%D1%8C%D0%B2%D1%96%D0%B2%2C%20%D0%B2%D1%83%D0%BB.%20%D0%A4%D0%B5%D0%B4%D1%8C%D0%BA%D0%BE%D0%B2%D0%B8%D1%87%D0%B0%2C%2058&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
