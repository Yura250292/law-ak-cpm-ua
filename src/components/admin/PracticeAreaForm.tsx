"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/translit";

interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface PracticeAreaData {
  title: string;
  slug: string;
  shortDescription: string;
  icon: string;
  description: string;
  services: string[];
  advantages: string[];
  process: ProcessStep[];
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
}

const EMPTY: PracticeAreaData = {
  title: "",
  slug: "",
  shortDescription: "",
  icon: "⚖️",
  description: "",
  services: [],
  advantages: [],
  process: [],
  status: "PUBLISHED",
  sortOrder: 0,
};

const fieldCls =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

function StringListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-primary">{label}</span>
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={it}
            onChange={(e) => {
              const copy = [...items];
              copy[i] = e.target.value;
              onChange(copy);
            }}
            className={fieldCls}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="shrink-0 rounded-lg border border-border px-3 text-sm text-red-500 hover:bg-red-50"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted hover:border-accent/40 hover:text-primary"
      >
        + Додати
      </button>
    </div>
  );
}

export function PracticeAreaForm({
  id,
  initial,
}: {
  id?: string;
  initial?: PracticeAreaData;
}) {
  const router = useRouter();
  const [data, setData] = useState<PracticeAreaData>(initial ?? EMPTY);
  const [slugLocked, setSlugLocked] = useState(Boolean(initial?.slug));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slugLocked) setData((d) => ({ ...d, slug: slugify(d.title) }));
  }, [data.title, slugLocked]);

  function set<K extends keyof PracticeAreaData>(k: K, v: PracticeAreaData[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }

  async function save() {
    setError("");
    setSaving(true);
    try {
      const url = id
        ? `/api/admin/content/practice-areas/${id}`
        : "/api/admin/content/practice-areas";
      const res = await fetch(url, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.status === 401) return router.push("/admin/login");
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Помилка");
      router.push("/admin/practice-areas");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-primary">Назва</span>
          <input value={data.title} onChange={(e) => set("title", e.target.value)} className={fieldCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-primary">Slug</span>
          <input
            value={data.slug}
            onChange={(e) => {
              setSlugLocked(true);
              set("slug", e.target.value);
            }}
            className={fieldCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-primary">Іконка (emoji)</span>
          <input value={data.icon} onChange={(e) => set("icon", e.target.value)} className={fieldCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-primary">Порядок</span>
          <input
            type="number"
            value={data.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value))}
            className={fieldCls}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-primary">Короткий опис</span>
        <textarea
          value={data.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
          className={fieldCls + " min-h-[60px] resize-y"}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-primary">
          Повний опис (абзаци розділяйте порожнім рядком)
        </span>
        <textarea
          value={data.description}
          onChange={(e) => set("description", e.target.value)}
          className={fieldCls + " min-h-[160px] resize-y"}
        />
      </label>

      <StringListEditor label="Послуги" items={data.services} onChange={(v) => set("services", v)} />
      <StringListEditor label="Переваги" items={data.advantages} onChange={(v) => set("advantages", v)} />

      {/* Process steps */}
      <div className="space-y-2">
        <span className="block text-sm font-medium text-primary">Етапи роботи</span>
        {data.process.map((p, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-border bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent">Крок {i + 1}</span>
              <button
                type="button"
                onClick={() =>
                  set(
                    "process",
                    data.process
                      .filter((_, idx) => idx !== i)
                      .map((s, idx) => ({ ...s, step: idx + 1 }))
                  )
                }
                className="text-xs text-red-500 hover:underline"
              >
                Видалити
              </button>
            </div>
            <input
              value={p.title}
              onChange={(e) => {
                const copy = [...data.process];
                copy[i] = { ...p, title: e.target.value };
                set("process", copy);
              }}
              placeholder="Назва етапу"
              className={fieldCls}
            />
            <textarea
              value={p.description}
              onChange={(e) => {
                const copy = [...data.process];
                copy[i] = { ...p, description: e.target.value };
                set("process", copy);
              }}
              placeholder="Опис етапу"
              className={fieldCls + " min-h-[60px] resize-y"}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            set("process", [
              ...data.process,
              { step: data.process.length + 1, title: "", description: "" },
            ])
          }
          className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted hover:border-accent/40 hover:text-primary"
        >
          + Етап
        </button>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.status === "PUBLISHED"}
            onChange={(e) => set("status", e.target.checked ? "PUBLISHED" : "DRAFT")}
          />
          Опубліковано
        </label>
        <button
          onClick={save}
          disabled={saving}
          className="ml-auto rounded-lg bg-accent px-6 py-2 text-sm font-bold text-primary transition hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? "Збереження…" : "Зберегти"}
        </button>
      </div>
    </div>
  );
}

export default PracticeAreaForm;
