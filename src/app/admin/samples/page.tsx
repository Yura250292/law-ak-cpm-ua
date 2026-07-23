"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ImageUploadField } from "@/components/admin/editor/ImageUploadField";

interface Sample {
  id?: string;
  title: string;
  description: string;
  fileUrl: string;
  sizeLabel: string;
  iconKey: string;
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
}

const EMPTY: Sample = {
  title: "",
  description: "",
  fileUrl: "",
  sizeLabel: "PDF",
  iconKey: "document",
  status: "PUBLISHED",
  sortOrder: 0,
};

const ICON_OPTIONS = [
  { key: "document", label: "Документ" },
  { key: "claim", label: "Позов" },
  { key: "complaint", label: "Скарга" },
  { key: "contract", label: "Договір" },
  { key: "court", label: "Заява до суду" },
];

const fieldCls =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

export default function SamplesAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Sample | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/content/samples");
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
      ? `/api/admin/content/samples/${editing.id}`
      : "/api/admin/content/samples";
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
    if (!confirm("Видалити зразок?")) return;
    const res = await fetch(`/api/admin/content/samples/${id}`, { method: "DELETE" });
    if (res.ok) setItems((a) => a.filter((x) => x.id !== id));
  }

  return (
    <AdminPageShell
      title="Зразки документів"
      action={
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-primary transition hover:bg-accent-hover"
        >
          + Додати
        </button>
      }
    >
      {loading ? (
        <p className="text-muted">Завантаження…</p>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between rounded-xl border border-border bg-white p-4"
            >
              <div>
                <p className="font-medium text-primary">{it.title}</p>
                <p className="text-xs text-muted">{it.sizeLabel}</p>
              </div>
              <div className="flex gap-3 text-xs">
                <button onClick={() => setEditing({ ...it })} className="text-accent hover:underline">
                  Редагувати
                </button>
                <button onClick={() => it.id && remove(it.id)} className="text-red-500 hover:underline">
                  Видалити
                </button>
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
            className="my-8 w-full max-w-lg space-y-3 rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-primary">
              {editing.id ? "Редагувати зразок" : "Новий зразок"}
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
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-primary">Опис</span>
              <textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className={fieldCls + " min-h-[70px] resize-y"}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-primary">Розмір/мітка</span>
                <input
                  value={editing.sizeLabel}
                  onChange={(e) => setEditing({ ...editing, sizeLabel: e.target.value })}
                  className={fieldCls}
                  placeholder="PDF · 240 KB"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-primary">Іконка</span>
                <select
                  value={editing.iconKey}
                  onChange={(e) => setEditing({ ...editing, iconKey: e.target.value })}
                  className={fieldCls}
                >
                  {ICON_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <span className="mb-1 block text-sm font-medium text-primary">Файл (PDF)</span>
              <ImageUploadField
                value={editing.fileUrl}
                onChange={(url) => setEditing({ ...editing, fileUrl: url })}
                kind="sample-file"
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
