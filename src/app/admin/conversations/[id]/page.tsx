"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  IN_PROGRESS,
  ROLE_LABELS,
  SOURCE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatClock,
  type ConversationStatus,
  type ConversationSummary,
  type Utterance,
} from "@/lib/conversations/types";

interface Conversation {
  id: string;
  source: string;
  title: string | null;
  clientName: string | null;
  clientPhone: string | null;
  recordedAt: string;
  fileName: string | null;
  audioR2Key: string | null;
  audioDurationMs: number | null;
  status: ConversationStatus;
  utterances: Utterance[] | null;
  structured: ConversationSummary | null;
  lawyerNotes: string | null;
  processingError: string | null;
  aiModel: string | null;
}

type Form = Pick<Conversation, "title" | "clientName" | "clientPhone" | "lawyerNotes">;

const fieldCls =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent";

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted">{title}</h3>
      <ul className="space-y-1.5 text-sm leading-relaxed">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-accent">•</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SummaryView({ s }: { s: ConversationSummary }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
          {s.matterType}
        </span>
      </div>
      <p className="text-sm leading-relaxed">{s.summary}</p>
      {s.clientRequest && (
        <section>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted">
            Чого хоче клієнт
          </h3>
          <p className="text-sm leading-relaxed">{s.clientRequest}</p>
        </section>
      )}
      {s.nextSteps.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted">
            Наступні кроки
          </h3>
          <ul className="space-y-2 text-sm">
            {s.nextSteps.map((n, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-2">
                <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-primary">
                  {ROLE_LABELS[n.who]}
                </span>
                <span className="flex-1">{n.action}</span>
                {n.due && <span className="text-xs font-medium text-accent">до {n.due}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
      <Section title="Домовленості" items={s.agreements} />
      <Section title="Строки" items={s.deadlines} />
      <Section title="Документи від клієнта" items={s.documentsRequested} />
      <Section title="Обставини справи" items={s.facts} />
      <Section title="Що порадив адвокат" items={s.lawyerAdvice} />
      <Section title="Ризики" items={s.risks} />
      <Section title="Що уточнити" items={s.openQuestions} />
    </div>
  );
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const audio = useRef<HTMLAudioElement>(null);
  const [item, setItem] = useState<Conversation | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [tab, setTab] = useState<"summary" | "transcript">("summary");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/conversations/${id}`);
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Не вдалося завантажити розмову");
      return;
    }
    const c = json.item as Conversation;
    setItem(c);
    // Поля форми підтягуємо з сервера, лише поки адвокат їх не правив.
    setForm((f) =>
      f ?? {
        title: c.title,
        clientName: c.clientName,
        clientPhone: c.clientPhone,
        lawyerNotes: c.lawyerNotes,
      }
    );
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const inProgress = item ? IN_PROGRESS.includes(item.status) : false;
  useEffect(() => {
    if (!inProgress) return;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [inProgress, load]);

  // Самарі дописало назву й клієнта — показуємо їх у формі, якщо там було порожньо.
  useEffect(() => {
    if (!item || !form) return;
    if (item.status !== "READY") return;
    setForm((f) =>
      f && {
        ...f,
        title: f.title ?? item.title,
        clientName: f.clientName ?? item.clientName,
        clientPhone: f.clientPhone ?? item.clientPhone,
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.status]);

  async function save() {
    if (!form) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error ?? "Не вдалося зберегти");
      return;
    }
    setItem(json.item);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function retry() {
    setError(null);
    const res = await fetch(`/api/admin/conversations/${id}/retry`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Не вдалося запустити обробку");
      return;
    }
    setItem((c) => c && { ...c, status: c.utterances ? "TRANSCRIBED" : "UPLOADED", processingError: null });
  }

  async function remove() {
    if (!confirm("Видалити розмову разом із записом і транскриптом? Це незворотно.")) return;
    const res = await fetch(`/api/admin/conversations/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Не вдалося видалити");
      return;
    }
    router.push("/admin/conversations");
  }

  function seek(ms: number) {
    const a = audio.current;
    if (!a) return;
    a.currentTime = ms / 1000;
    a.play().catch(() => {});
  }

  if (!item || !form) {
    return (
      <AdminPageShell title="Розмова">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : (
          <div className="text-sm text-muted">Завантаження…</div>
        )}
      </AdminPageShell>
    );
  }

  const roles = new Map(item.structured?.speakers.map((s) => [s.label, s]) ?? []);
  const speakerName = (label: string) => {
    const s = roles.get(label);
    if (!s) return `Спікер ${label}`;
    return s.name ? `${ROLE_LABELS[s.role]} · ${s.name}` : ROLE_LABELS[s.role];
  };

  return (
    <AdminPageShell
      title={item.title ?? "Розмова"}
      action={
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[item.status]}`}>
          {STATUS_LABELS[item.status]}
        </span>
      }
    >
      <div className="mb-4 text-sm text-muted">
        {new Date(item.recordedAt).toLocaleString("uk-UA")}
        {item.audioDurationMs ? ` · ${formatClock(item.audioDurationMs)}` : ""}
        {` · ${SOURCE_LABELS[item.source] ?? item.source}`}
        {item.fileName ? ` · ${item.fileName}` : ""}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-800">
          {error}
        </div>
      )}
      {item.status === "FAILED" && item.processingError && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800">
          <span>{item.processingError}</span>
          <button onClick={retry} className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white">
            Повторити обробку
          </button>
        </div>
      )}
      {inProgress && (
        <div className="mb-4 rounded-xl border border-border bg-white px-5 py-3 text-sm text-primary">
          {STATUS_LABELS[item.status]} Сторінка оновиться сама.
        </div>
      )}

      {item.audioR2Key && (
        <audio
          ref={audio}
          controls
          preload="metadata"
          src={`/api/admin/conversations/${id}/audio`}
          className="mb-6 w-full"
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-5 flex gap-2">
            {(["summary", "transcript"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  tab === t ? "bg-primary text-white" : "text-muted hover:bg-surface"
                }`}
              >
                {t === "summary" ? "Самарі" : "Транскрипт"}
              </button>
            ))}
          </div>

          {tab === "summary" &&
            (item.structured ? (
              <SummaryView s={item.structured} />
            ) : (
              <p className="text-sm text-muted">Самарі ще немає.</p>
            ))}

          {tab === "transcript" &&
            (item.utterances?.length ? (
              <ol className="space-y-4">
                {item.utterances.map((u, i) => (
                  <li key={i} className="text-sm">
                    <div className="mb-0.5 flex items-center gap-2 text-xs">
                      <button
                        onClick={() => seek(u.start)}
                        className="font-mono text-accent hover:underline"
                        title="Слухати з цього місця"
                      >
                        {formatClock(u.start)}
                      </button>
                      <span className="font-semibold text-primary">{speakerName(u.speaker)}</span>
                    </div>
                    <p className="leading-relaxed">{u.text}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">Транскрипту ще немає.</p>
            ))}
        </div>

        <aside className="space-y-4">
          <div className="space-y-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
            <label className="block text-xs font-medium text-muted">
              Назва
              <input
                value={form.title ?? ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={`${fieldCls} mt-1`}
              />
            </label>
            <label className="block text-xs font-medium text-muted">
              Клієнт
              <input
                value={form.clientName ?? ""}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                className={`${fieldCls} mt-1`}
              />
            </label>
            <label className="block text-xs font-medium text-muted">
              Телефон
              <input
                value={form.clientPhone ?? ""}
                onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                className={`${fieldCls} mt-1`}
              />
            </label>
            <label className="block text-xs font-medium text-muted">
              Нотатки адвоката
              <textarea
                rows={6}
                value={form.lawyerNotes ?? ""}
                onChange={(e) => setForm({ ...form, lawyerNotes: e.target.value })}
                className={`${fieldCls} mt-1`}
              />
            </label>
            <button
              onClick={save}
              disabled={saving}
              className="w-full rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-primary transition hover:bg-accent-hover disabled:opacity-60"
            >
              {saving ? "Зберігаю…" : saved ? "Збережено" : "Зберегти"}
            </button>
          </div>

          <div className="space-y-2 rounded-2xl border border-border bg-white p-5 text-sm shadow-sm">
            {item.status === "READY" && (
              <button
                onClick={retry}
                className="w-full rounded-xl border border-border px-4 py-2 font-medium text-primary transition hover:bg-surface"
              >
                Перескласти самарі
              </button>
            )}
            <button
              onClick={remove}
              className="w-full rounded-xl border border-red-200 px-4 py-2 font-medium text-red-700 transition hover:bg-red-50"
            >
              Видалити розмову
            </button>
            {item.aiModel && <p className="pt-1 text-xs text-muted">Самарі: {item.aiModel}</p>}
          </div>
        </aside>
      </div>
    </AdminPageShell>
  );
}
