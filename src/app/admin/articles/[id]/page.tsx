"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArticleEditor } from "@/components/admin/editor/ArticleEditor";
import { parseBlocks, type Block } from "@/lib/content-blocks";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface LoadedArticle {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  coverImage: string | null;
  readTime: string;
  status: "DRAFT" | "PUBLISHED";
  blocks: Block[];
}

export default function EditArticlePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [initial, setInitial] = useState<LoadedArticle | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/content/articles/${id}`);
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Помилка");
        const a = data.article;
        setInitial({
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          category: a.category,
          author: a.author,
          coverImage: a.coverImage,
          readTime: a.readTime,
          status: a.status,
          blocks: parseBlocks(a.blocks),
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Помилка");
      }
    })();
  }, [id, router]);

  return (
    <div className="min-h-screen bg-surface">
      {error ? (
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800">
            {error}
          </div>
        </div>
      ) : initial ? (
        <ArticleEditor id={id} initial={initial} />
      ) : (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      )}
    </div>
  );
}
