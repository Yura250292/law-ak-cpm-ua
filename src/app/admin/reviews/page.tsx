"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ImageUploadField } from "@/components/admin/editor/ImageUploadField";

interface Review {
  id?: string;
  kind: "review" | "case";
  name: string;
  text: string;
  result?: string | null;
  rating: number;
  service: string;
  photos: string[];
  featured: boolean;
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
}

const EMPTY: Review = {
  kind: "review",
  name: "",
  text: "",
  result: "",
  rating: 5,
  service: "",
  photos: [],
  featured: false,
  status: "PUBLISHED",
  sortOrder: 0,
};

const fieldCls =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

export default function ReviewsAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Review | null>(null);
  const [filter, setFilter] = useState<"all" | "review" | "case">("all");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/content/reviews");
    if (res.status === 401) return router.push("/admin/login");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    if (!editing) return;
    setError("");
    const url = editing.id
      ? `/api/admin/content/reviews/${editing.id}`
      : "/api/admin/content/reviews";
    const res = await fetch(url, {
      method: editing.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.status === 401) return router.push("/admin/login");
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error || "Помилка");
      return;
    }
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Видалити запис?")) return;
    const res = await fetch(`/api/admin/content/reviews/${id}`, { method: "DELETE" });
    if (res.ok) setItems((a) => a.filter((x) => x.id !== id));
  }

  const filtered = items.filter((i) => filter === "all" || i.kind === filter);

  return (
    <AdminPageShell
      title="Відгуки та кейси"
      action={
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-primary transition hover:bg-accent-hover"
        >
          + Додати
        </button>
      }
    >
      <div className="mb-4 flex gap-2">
        {(["all", "review", "case"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filter === f ? "bg-primary text-white" : "bg-white text-muted border border-border"
            }`}
          >
            {f === "all" ? "Всі" : f === "review" ? "Відгуки" : "Кейси"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted">Завантаження…</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((it) => (
            <div
              key={it.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-border bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted">
                    {it.kind === "case" ? "Кейс" : "Відгук"}
                  </span>
                  <span className="font-medium text-primary">{it.name}</span>
                  {it.featured ? (
                    <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent">
                      На головній
                    </span>
                  ) : null}
                  {it.photos.length > 0 ? (
                    <span className="text-xs text-muted">📷 {it.photos.length}</span>
                  ) : null}
                </div>
                <p className="line-clamp-2 text-sm text-muted">{it.text}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
                <button
                  onClick={() => setEditing({ ...it, result: it.result ?? "" })}
                  className="text-accent hover:underline"
                >
                  Редагувати
                </button>
                <button
                  onClick={() => it.id && remove(it.id)}
                  className="text-red-500 hover:underline"
                >
                  Видалити
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="my-8 w-full max-w-lg space-y-3 rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-primary">
              {editing.id ? "Редагувати" : "Новий запис"}
            </h2>
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            ) : null}

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-primary">Тип</span>
              <select
                value={editing.kind}
                onChange={(e) => setEditing({ ...editing, kind: e.target.value as "review" | "case" })}
                className={fieldCls}
              >
                <option value="review">Відгук</option>
                <option value="case">Кейс (справа)</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-primary">
                {editing.kind === "case" ? "Категорія справи" : "Імʼя клієнта"}
              </span>
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className={fieldCls}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-primary">
                {editing.kind === "case" ? "Опис справи" : "Текст відгуку"}
              </span>
              <textarea
                value={editing.text}
                onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                className={fieldCls + " min-h-[100px] resize-y"}
              />
            </label>

            {editing.kind === "case" ? (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-primary">Результат</span>
                <textarea
                  value={editing.result ?? ""}
                  onChange={(e) => setEditing({ ...editing, result: e.target.value })}
                  className={fieldCls + " min-h-[70px] resize-y"}
                />
              </label>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-primary">Послуга</span>
                <input
                  value={editing.service}
                  onChange={(e) => setEditing({ ...editing, service: e.target.value })}
                  className={fieldCls}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-primary">Оцінка</span>
                <select
                  value={editing.rating}
                  onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
                  className={fieldCls}
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} ★
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Photos */}
            <div>
              <span className="mb-1 block text-sm font-medium text-primary">
                Скріншоти (Instagram, реальні справи)
              </span>
              <div className="mb-2 flex flex-wrap gap-2">
                {editing.photos.map((p, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p} alt="" className="h-16 w-16 rounded-lg border border-border object-cover" />
                    <button
                      onClick={() =>
                        setEditing({ ...editing, photos: editing.photos.filter((_, idx) => idx !== i) })
                      }
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <ImageUploadField
                value=""
                onChange={(url) =>
                  url && setEditing((prev) => (prev ? { ...prev, photos: [...prev.photos, url] } : prev))
                }
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-border pt-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.featured}
                  onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                />
                На головній
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.status === "PUBLISHED"}
                  onChange={(e) =>
                    setEditing({ ...editing, status: e.target.checked ? "PUBLISHED" : "DRAFT" })
                  }
                />
                Опубліковано
              </label>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-muted"
                >
                  Скасувати
                </button>
                <button
                  onClick={save}
                  className="rounded-lg bg-accent px-5 py-2 text-sm font-bold text-primary hover:bg-accent-hover"
                >
                  Зберегти
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
