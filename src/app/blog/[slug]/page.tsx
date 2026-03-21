import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getBlogPost, getRelatedPosts, blogPosts } from "@/lib/blog-data";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return { title: "Стаття не знайдена" };
  }

  return {
    title: `${post.title} — LAWAK`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const related = getRelatedPosts(slug, 3);
  const paragraphs = post.content.split("\n\n");

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-16 text-white sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">
                  {post.category}
                </span>
                <span className="text-sm text-white/50">
                  {formatDate(post.date)}
                </span>
                <span className="text-sm text-white/50">{post.readTime}</span>
              </div>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                {post.title}
              </h1>
              <p className="mt-4 text-base text-white/60">{post.author}</p>
            </div>
          </div>
        </section>

        {/* Article content */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <article className="space-y-6">
                {paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-base leading-relaxed text-primary/80 sm:text-lg sm:leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </article>

              {/* CTA */}
              <div className="mt-16 rounded-2xl bg-surface p-8 sm:p-10">
                <h2 className="text-2xl font-bold text-primary">
                  Потрібна допомога?
                </h2>
                <p className="mt-3 text-muted">
                  Замовте документ або запишіться на консультацію до адвоката.
                  Працюємо онлайн по всій Україні.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/services"
                    className="inline-flex items-center justify-center rounded-xl bg-accent px-7 py-3 text-sm font-bold text-primary transition-all duration-200 hover:bg-accent-hover hover:shadow-lg active:scale-[0.98]"
                  >
                    Замовити документ
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center rounded-xl border-2 border-primary px-7 py-3 text-sm font-bold text-primary transition-all duration-200 hover:bg-primary hover:text-white"
                  >
                    Записатися на консультацію
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="bg-surface py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="mb-10 text-center text-3xl font-bold text-primary">
                Читайте також
              </h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((relPost) => (
                  <Link
                    key={relPost.slug}
                    href={`/blog/${relPost.slug}`}
                    className="group"
                  >
                    <div className="flex h-full flex-col rounded-2xl border border-border bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-primary">
                          {relPost.category}
                        </span>
                        <span className="text-xs text-muted">
                          {relPost.readTime}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold leading-snug text-primary transition-colors duration-200 group-hover:text-accent">
                        {relPost.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {relPost.excerpt}
                      </p>
                      <div className="mt-auto flex items-center justify-between border-t border-border pt-4 mt-4">
                        <span className="text-xs text-muted">
                          {formatDate(relPost.date)}
                        </span>
                        <span className="text-sm font-semibold text-accent transition-transform duration-200 group-hover:translate-x-1">
                          Читати &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Back to blog */}
        <section className="bg-white py-10">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors duration-200 hover:text-primary"
            >
              &larr; Повернутися до блогу
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
