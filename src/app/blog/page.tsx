import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { getPublishedArticles } from "@/lib/content";
import { plannedTopics, lifeSituations } from "@/lib/blog-topics";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export const metadata = {
  title: "Статті | Корисні матеріали з права",
  description:
    "Статті адвоката Кабаль Анастасії. Корисні матеріали про сімейне, цивільне право, судові витрати та практичні поради. Актуальна інформація для громадян України.",
};

export const dynamic = "force-dynamic";

function formatDate(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return date.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const blogPosts = await getPublishedArticles();
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold sm:text-5xl">
              Статті
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/60">
              Корисні матеріали про українське законодавство, судову практику та
              практичні поради від адвоката.
            </p>
          </div>
        </section>

        {/* Articles grid */}
        {blogPosts.length > 0 && (
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group"
                >
                  <Card className="flex h-full flex-col">
                    <CardHeader>
                      <div className="mb-3 flex items-center gap-3">
                        <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-primary">
                          {post.category}
                        </span>
                        <span className="text-xs text-muted">
                          {post.readTime}
                        </span>
                      </div>
                      <CardTitle className="transition-colors duration-200 group-hover:text-accent">
                        {post.title}
                      </CardTitle>
                      <CardDescription>{post.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <div className="flex items-center justify-between border-t border-border pt-4">
                        <span className="text-xs text-muted">
                          {formatDate(post.publishedAt ?? post.createdAt)}
                        </span>
                        <span className="text-sm font-semibold text-accent transition-transform duration-200 group-hover:translate-x-1">
                          Читати &rarr;
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* Теми, які готуються */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-14 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                У роботі
              </p>
              <h2 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
                Теми, які я розкрию найближчим часом
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-muted">
                Перелік матеріалів, над якими я працюю. Якщо якесь питання
                стосується саме вашої ситуації — не чекайте статті, запишіться на
                консультацію.
              </p>
            </Reveal>

            <Stagger
              className="grid gap-6 lg:grid-cols-2"
              whileInView
              delayChildren={0.1}
              staggerChildren={0.1}
            >
              {plannedTopics.map((group, idx) => (
                <StaggerItem key={group.id} className="h-full">
                  <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface/40 p-8 transition-all duration-300 hover:border-accent/40 hover:bg-white hover:shadow-[0_28px_60px_-30px_rgba(198,166,103,0.35)]">
                    <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -top-4 right-5 select-none font-display text-[5.5rem] font-bold leading-none text-accent/[0.09]"
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>

                    <h3 className="relative mb-5 font-display text-2xl font-semibold text-primary">
                      {group.title}
                    </h3>

                    <ul className="relative space-y-3">
                      {group.topics.map((topic) => (
                        <li key={topic} className="flex items-start gap-3">
                          <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                          <span className="text-sm leading-snug text-primary/80">
                            {topic}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Типові життєві ситуації */}
        <section className="relative overflow-hidden bg-primary py-20 text-white">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-accent/[0.06] blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-14 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Рубрика
              </p>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                Типові життєві ситуації
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-white/60">
                Питання, з якими до мене звертаються найчастіше. Впізнали свою
                ситуацію — значить, рішення для неї вже існує.
              </p>
            </Reveal>

            <Stagger
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              whileInView
              delayChildren={0.08}
              staggerChildren={0.05}
            >
              {lifeSituations.map((situation, idx) => (
                <StaggerItem key={situation} className="h-full">
                  <div className="flex h-full items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-white/[0.07]">
                    <span className="font-display text-sm font-bold text-accent/70">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm leading-snug text-white/80">
                      {situation}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal delay={0.2}>
              <div className="mt-12 text-center">
                <p className="mb-6 text-base text-white/60">
                  Не знайшли свою ситуацію? Опишіть її — розберемо індивідуально.
                </p>
                <Link
                  href="/consultation"
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-primary shadow-lg shadow-accent/20 transition-all duration-200 hover:bg-accent-hover hover:shadow-xl active:scale-[0.98]"
                >
                  Записатись на консультацію
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-primary">
              Потрібна юридична допомога?
            </h2>
            <p className="mt-4 text-lg text-muted">
              Замовте складання документа або запишіться на консультацію до
              адвоката онлайн.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-xl bg-accent px-8 py-3 text-sm font-bold text-primary transition-all duration-200 hover:bg-accent-hover hover:shadow-lg active:scale-[0.98]"
              >
                Переглянути послуги
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-xl border-2 border-primary px-8 py-3 text-sm font-bold text-primary transition-all duration-200 hover:bg-primary hover:text-white"
              >
                Про адвоката
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
