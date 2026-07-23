import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArticleView } from "@/components/content/ArticleView";
import { getArticleBySlug, getRelatedArticles } from "@/lib/content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getArticleBySlug(slug);

  if (!post) {
    return { title: "Стаття не знайдена" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: (post.publishedAt ?? post.createdAt).toISOString(),
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getArticleBySlug(slug);

  if (!post) {
    notFound();
  }

  const related = await getRelatedArticles(slug, post.category, 3);

  return (
    <>
      <Header />
      <main className="flex-1">
        <ArticleView article={post} related={related} />
      </main>
      <Footer />
    </>
  );
}
