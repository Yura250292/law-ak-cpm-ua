"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TrustedSource {
  id: string;
  name: string;
  url: string;
  domain: string;
  createdAt: string;
}

export default function SourcesPage() {
  const router = useRouter();
  const [items, setItems] = useState<TrustedSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sources");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Не вдалося завантажити джерела");
      setItems(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося завантажити джерела");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!url.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Не вдалося додати джерело");
      setItems((prev) => [...prev, data.item]);
      setName("");
      setUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося додати джерело");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: TrustedSource) {
    if (!window.confirm(`Прибрати «${item.name}» зі списку офіційних джерел?`)) return;
    const res = await fetch(`/api/admin/sources/${item.id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((s) => s.id !== item.id));
    else setError("Не вдалося видалити джерело");
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-primary text-white sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-14">
          <Link href="/admin" className="text-white/70 hover:text-white transition text-sm">
            &larr; До заявок
          </Link>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-sm font-medium">Джерела</span>
          <div className="flex-1" />
          <Link
            href="/admin/case-analysis"
            className="text-sm text-accent hover:text-accent-hover transition font-medium"
          >
            Аналіз справи
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">Офіційні джерела</h1>
          <p className="text-sm text-muted">
            У чаті «Аналіз справи» помічник шукає в інтернеті спершу на цих сайтах, а
            вже потім — деінде. Посилання з цих сайтів позначаються «🏛 Офіційний
            сайт». Підсайти теж враховуються: для zakon.rada.gov.ua — і
            data.zakon.rada.gov.ua.
          </p>
        </div>

        {error && (
          <div className="px-5 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        <form
          onSubmit={handleAdd}
          className="bg-white rounded-2xl border border-border p-5 space-y-3"
        >
          <h2 className="text-sm font-bold text-primary">Додати сайт</h2>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Посилання, напр. https://zakon.rada.gov.ua"
            className="w-full h-10 px-4 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent transition"
            required
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Назва (необов'язково), напр. Пенсійний фонд України"
            className="w-full h-10 px-4 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent transition"
          />
          <button
            type="submit"
            disabled={!url.trim() || saving}
            className="h-10 px-5 bg-accent text-primary font-semibold rounded-xl hover:bg-accent-hover transition disabled:opacity-40"
          >
            {saving ? "Додаю…" : "Додати"}
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="text-sm font-bold text-primary mb-3">
            У списку {loading ? "" : `(${items.length})`}
          </h2>
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-accent border-t-transparent rounded-full" />
          ) : items.length === 0 ? (
            <p className="text-xs text-muted">
              Список порожній — помічник шукатиме по всьому інтернету.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-primary truncate">
                      🏛 {s.name}
                    </div>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline hover:text-blue-800"
                    >
                      {s.domain}
                    </a>
                  </div>
                  <button
                    onClick={() => handleDelete(s)}
                    className="shrink-0 px-2 py-1 text-xs text-muted hover:text-red-700 transition"
                    aria-label={`Видалити ${s.name}`}
                  >
                    Видалити
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
