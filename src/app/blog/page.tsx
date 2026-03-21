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
import { blogPosts } from "@/lib/blog-data";

export const metadata = {
  title: "Юридичний блог — LAWAK | Корисні статті з права",
  description:
    "Юридичний блог адвоката Кабаль Анастасії. Корисні статті про сімейне, цивільне право, судові витрати та практичні поради. Актуальна інформація для громадян України.",
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold sm:text-5xl">
              Юридичний блог
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/60">
              Корисні статті про українське законодавство, судову практику та
              практичні поради від адвоката.
            </p>
          </div>
        </section>

        {/* Articles grid */}
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
                          {formatDate(post.date)}
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
