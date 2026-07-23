"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ImageUploadField } from "@/components/admin/editor/ImageUploadField";

interface Certificate {
  id?: string;
  title: string;
  imageUrl: string;
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
}

const fieldCls =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

export default function CertificatesAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/content/certificates");
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
    if (!editing.imageUrl) return setError("Завантажте скріншот");
    setError("");
    const url = editing.id
      ? `/api/admin/content/certificates/${editing.id}`
      : "/api/admin/content/certificates";
    const res = await fetch(url, {
      method: editing.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.status === 401) return router.push("/admin/login");
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return setError(body.error || "Помилка");
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Видалити сертифікат?")) return;
    const res = await fetch(`/api/admin/content/certificates/${id}`, { method: "DELETE" });
    if (res.ok) setItems((a) => a.filter((x) => x.id !== id));
  }

  return (
    <AdminPageShell
      title="Сертифікати"
      action={
        <button
          onClick={() =>
            setEditing({ title: "", imageUrl: "", status: "PUBLISHED", sortOrder: items.length })
          }
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-primary transition hover:bg-accent-hover"
        >
          + Додати
        </button>
      }
    >
      <p className="mb-4 text-sm text-muted">
        Скріншоти підтвердження підвищення кваліфікації — показуються на сторінці
        «Про адвоката».
      </p>

      {loading ? (
        <p className="text-muted">Завантаження…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((it) => (
            <div key={it.id} className="overflow-hidden rounded-xl border border-border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.imageUrl} alt={it.title} className="aspect-[4/3] w-full object-cover" />
              <div className="p-3">
                <p className="mb-2 text-sm font-medium text-primary">{it.title}</p>
                <div className="flex gap-3 text-xs">
                  <button onClick={() => setEditing({ ...it })} className="text-accent hover:underline">
                    Редагувати
                  </button>
                  <button onClick={() => it.id && remove(it.id)} className="text-red-500 hover:underline">
                    Видалити
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="my-8 w-full max-w-md space-y-3 rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-primary">
              {editing.id ? "Редагувати" : "Новий сертифікат"}
            </h2>
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            ) : null}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-primary">Назва</span>
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className={fieldCls}
                placeholder="Сертифікат підвищення кваліфікації, 2025"
              />
            </label>
            <div>
              <span className="mb-1 block text-sm font-medium text-primary">Скріншот</span>
              <ImageUploadField
                value={editing.imageUrl}
                onChange={(url) => setEditing({ ...editing, imageUrl: url })}
              />
            </div>
            <div className="flex items-center gap-4 border-t border-border pt-3">
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
