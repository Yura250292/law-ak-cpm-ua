"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

interface Row {
  id: string;
  slug: string;
  title: string;
  icon: string;
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
}

export default function PracticeAreasListPage() {
  const router = useRouter();
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/content/practice-areas");
      if (res.status === 401) return router.push("/admin/login");
      const data = await res.json();
      setItems(data.items ?? []);
      setLoading(false);
    })();
  }, [router]);

  async function remove(id: string) {
    if (!confirm("Видалити напрямок?")) return;
    const res = await fetch(`/api/admin/content/practice-areas/${id}`, {
      method: "DELETE",
    });
    if (res.ok) setItems((a) => a.filter((x) => x.id !== id));
  }

  return (
    <AdminPageShell
      title="Послуги"
      action={
        <Link
          href="/admin/practice-areas/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-primary transition hover:bg-accent-hover"
        >
          + Новий напрямок
        </Link>
      }
    >
      {loading ? (
        <p className="text-muted">Завантаження…</p>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3"
            >
              <Link
                href={`/admin/practice-areas/${it.id}`}
                className="flex items-center gap-3 font-medium text-primary hover:text-accent"
              >
                <span className="text-xl">{it.icon}</span>
                {it.title}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    it.status === "PUBLISHED"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {it.status === "PUBLISHED" ? "Опубл." : "Чернетка"}
                </span>
              </Link>
              <button
                onClick={() => remove(it.id)}
                className="text-xs text-red-500 hover:underline"
              >
                Видалити
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
