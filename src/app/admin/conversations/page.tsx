"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AUDIO_ACCEPT } from "@/lib/conversations/keys";
import {
  IN_PROGRESS,
  SOURCE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatClock,
  type ConversationStatus,
} from "@/lib/conversations/types";

interface Item {
  id: string;
  title: string | null;
  clientName: string | null;
  clientPhone: string | null;
  recordedAt: string;
  audioDurationMs: number | null;
  status: ConversationStatus;
  source: string;
  fileName: string | null;
}

interface ListResponse {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
}

const FILTERS: ("" | ConversationStatus)[] = ["", "READY", "TRANSCRIBING", "FAILED"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ConversationsPage() {
  const router = useRouter();
  const [data, setData] = useState<ListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"" | ConversationStatus>("");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    if (search) params.set("q", search);
    const res = await fetch(`/api/admin/conversations?${params}`);
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Не вдалося завантажити розмови");
      return;
    }
    setError(null);
    setData(json);
  }, [page, status, search, router]);

  useEffect(() => {
    load();
  }, [load]);

  // Поки щось обробляється — оновлюємо список.
  const busy = data?.items.some((i) => IN_PROGRESS.includes(i.status));
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [busy, load]);

  async function upload(file: File) {
    setError(null);
    setUploading(`Завантаження «${file.name}»…`);
    try {
      const contentType = file.type || "application/octet-stream";
      const start = await fetch("/api/admin/conversations/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType, size: file.size }),
      });
      const s = await start.json();
      if (!start.ok) throw new Error(s.error ?? "Не вдалося почати завантаження");

      const put = await fetch(s.url, {
        method: "PUT",
        headers: { "Content-Type": s.contentType },
        body: file,
      });
      if (!put.ok) throw new Error(`Сховище відхилило файл (HTTP ${put.status})`);

      const done = await fetch(`/api/admin/conversations/${s.id}/complete-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: s.key, contentType: s.contentType }),
      });
      const d = await done.json();
      if (!done.ok) throw new Error(d.error ?? "Не вдалося завершити завантаження");

      router.push(`/admin/conversations/${s.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <AdminPageShell
      title="Розмови"
      action={
        <>
          <input
            ref={fileInput}
            type="file"
            accept={AUDIO_ACCEPT}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
          <button
            onClick={() => fileInput.current?.click()}
            disabled={!!uploading}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-primary transition hover:bg-accent-hover disabled:opacity-60"
          >
            {uploading ? "Завантажую…" : "Завантажити запис"}
          </button>
        </>
      }
    >
      <p className="mb-6 text-sm text-muted">
        Записи розмов з клієнтами: надішліть аудіо Telegram-боту або завантажте тут. Транскрипт і
        самарі з&apos;являться за кілька хвилин.
      </p>

      {uploading && (
        <div className="mb-4 rounded-xl border border-border bg-white px-5 py-3 text-sm text-primary">
          {uploading}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-800">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(query.trim());
          }}
          className="flex min-w-0 flex-1 gap-2"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук: клієнт, телефон, назва, зміст"
            className="min-w-0 flex-1 rounded-xl border border-border bg-white px-4 py-2 text-sm outline-none focus:border-accent"
          />
          <button className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white">
            Знайти
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                status === s
                  ? "bg-primary text-white"
                  : "border border-border bg-white text-muted hover:bg-surface-dark"
              }`}
            >
              {s ? STATUS_LABELS[s] : "Всі"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {data && data.items.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted">
            {search || status ? "Нічого не знайдено" : "Розмов ще немає"}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data?.items.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/admin/conversations/${c.id}`}
                  className="flex flex-col gap-2 px-5 py-4 transition hover:bg-surface/50 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-primary">
                      {c.title ?? c.fileName ?? "Без назви"}
                    </div>
                    <div className="mt-0.5 text-xs text-muted">
                      {formatDate(c.recordedAt)}
                      {c.audioDurationMs ? ` · ${formatClock(c.audioDurationMs)}` : ""}
                      {` · ${SOURCE_LABELS[c.source] ?? c.source}`}
                    </div>
                  </div>
                  <div className="text-sm sm:w-48 sm:text-right">
                    {c.clientName && <div className="truncate">{c.clientName}</div>}
                    {c.clientPhone && <div className="text-xs text-muted">{c.clientPhone}</div>}
                  </div>
                  <span
                    className={`inline-block w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[c.status]}`}
                  >
                    {STATUS_LABELS[c.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-border bg-white px-3 py-1.5 disabled:opacity-40"
          >
            ← Назад
          </button>
          <span className="text-muted">
            {page} з {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-border bg-white px-3 py-1.5 disabled:opacity-40"
          >
            Далі →
          </button>
        </div>
      )}
    </AdminPageShell>
  );
}
