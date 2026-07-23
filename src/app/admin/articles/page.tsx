"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: string;
}

export default function ArticlesListPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content/articles");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Помилка");
      setArticles(data.articles);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function remove(id: string) {
    if (!confirm("Видалити статтю? Дію не можна скасувати.")) return;
    const res = await fetch(`/api/admin/content/articles/${id}`, {
      method: "DELETE",
    });
    if (res.ok) setArticles((a) => a.filter((x) => x.id !== id));
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 bg-primary text-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="text-sm text-white/70 hover:text-white">
            ← Адмін-панель
          </Link>
          <span className="text-sm font-semibold">Статті</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Статті блогу</h1>
          <Link
            href="/admin/articles/new"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-primary transition hover:bg-accent-hover"
          >
            + Нова стаття
          </Link>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="text-muted">Завантаження…</p>
        ) : articles.length === 0 ? (
          <p className="text-muted">Ще немає статей. Створіть першу.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface/50 text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Заголовок</th>
                  <th className="px-4 py-3">Категорія</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Оновлено</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/articles/${a.id}`}
                        className="font-medium text-primary hover:text-accent"
                      >
                        {a.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{a.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          a.status === "PUBLISHED"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {a.status === "PUBLISHED" ? "Опубліковано" : "Чернетка"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(a.updatedAt).toLocaleDateString("uk-UA")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => remove(a.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
