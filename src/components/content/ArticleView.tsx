import Link from "next/link";
import { BlockRenderer } from "@/components/content/BlockRenderer";
import type { ArticleData } from "@/lib/content";

function formatDate(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return date.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface ArticleViewProps {
  article: ArticleData;
  related?: ArticleData[];
  /** Банер попереднього перегляду для чернеток в адмінці. */
  preview?: boolean;
}

export function ArticleView({ article, related = [], preview }: ArticleViewProps) {
  const dateLabel = article.publishedAt ?? article.createdAt;

  return (
    <>
      {preview ? (
        <div className="bg-accent px-4 py-2 text-center text-sm font-semibold text-primary">
          Попередній перегляд — так стаття виглядатиме на сайті
        </div>
      ) : null}

      {/* Hero */}
      <section className="bg-primary py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">
                {article.category}
              </span>
              <span className="text-sm text-white/50">
                {formatDate(dateLabel)}
              </span>
              <span className="text-sm text-white/50">{article.readTime}</span>
            </div>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>
            <p className="mt-4 text-base text-white/60">{article.author}</p>
          </div>
        </div>
      </section>

      {/* Article content */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            {article.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.coverImage}
                alt={article.title}
                className="mb-10 w-full rounded-2xl border border-border"
              />
            ) : null}

            <article>
              <BlockRenderer blocks={article.blocks} />
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
                        {formatDate(relPost.publishedAt ?? relPost.createdAt)}
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
    </>
  );
}

export default ArticleView;
