import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { parseBlocks } from "@/lib/content-blocks";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArticleView } from "@/components/content/ArticleView";
import type { ArticleData } from "@/lib/content";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticlePreviewPage({ params }: PageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Статтю не знайдено
      </div>
    );
  }

  const data: ArticleData = {
    ...article,
    blocks: parseBlocks(article.blocks),
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        <ArticleView article={data} preview />
      </main>
      <Footer />
    </>
  );
}
