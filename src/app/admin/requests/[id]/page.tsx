"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface DocumentRequest {
  id: string;
  status: string;
  contactEmail: string;
  contactPhone: string | null;
  partyData: Record<string, unknown>;
  circumstancesData: Record<string, unknown>;
  requirementsData: Record<string, unknown>;
  generatedText: string | null;
  lawyerNotes: string | null;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
  template: {
    title: string;
    slug: string;
    category: string;
    price: number;
  };
  payment: {
    amount: number;
    status: string;
    createdAt: string;
  } | null;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Чернетка",
  PENDING_PAYMENT: "Очікує оплати",
  PAID: "Оплачено",
  GENERATING: "Генерація",
  PENDING_REVIEW: "На перевірці",
  COMPLETED: "Завершено",
  FAILED: "Помилка",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  GENERATING: "bg-purple-100 text-purple-800",
  PENDING_REVIEW: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function AdminRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [request, setRequest] = useState<DocumentRequest | null>(null);
  const [editedText, setEditedText] = useState("");
  const [lawyerNotes, setLawyerNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchRequest = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/requests/${id}`);
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRequest(data);
      setEditedText(data.generatedText ?? "");
      setLawyerNotes(data.lawyerNotes ?? "");
    } catch {
      setMessage({ type: "error", text: "Не вдалося завантажити заявку" });
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generatedText: editedText,
          lawyerNotes,
        }),
      });
      if (!res.ok) throw new Error();
      setMessage({ type: "success", text: "Зміни збережено" });
    } catch {
      setMessage({ type: "error", text: "Помилка збереження" });
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    if (
      !confirm(
        "Затвердити документ та відправити клієнту? Після затвердження текст буде конвертовано в PDF та відправлено на email клієнта."
      )
    ) {
      return;
    }

    // Save latest edits first
    setApproving(true);
    setMessage(null);
    try {
      // Save text changes first
      await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generatedText: editedText,
          lawyerNotes,
        }),
      });

      // Then approve
      const res = await fetch(`/api/admin/requests/${id}/approve`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Помилка затвердження");
      }

      setMessage({
        type: "success",
        text: "Документ затверджено та відправлено клієнту!",
      });
      // Refresh data
      await fetchRequest();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Помилка затвердження",
      });
    } finally {
      setApproving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <p className="text-muted mb-4">Заявку не знайдено</p>
          <Link
            href="/admin"
            className="text-sm text-accent hover:underline"
          >
            Повернутись
          </Link>
        </div>
      </div>
    );
  }

  const isEditable =
    request.status === "PENDING_REVIEW" || request.status === "GENERATING";
  const canApprove = request.status === "PENDING_REVIEW";

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-primary text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-white/70 hover:text-white transition text-sm"
            >
              &larr; Назад
            </Link>
            <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-none">
              {request.template.title}
            </span>
          </div>
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              STATUS_COLORS[request.status] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {STATUS_LABELS[request.status] ?? request.status}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 px-5 py-3 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Client info & form data */}
          <div className="space-y-6">
            {/* Client info */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="text-sm font-semibold text-primary mb-4">
                Клієнт
              </h2>
              <div className="space-y-2.5 text-sm">
                <div>
                  <span className="text-muted">Email: </span>
                  <a
                    href={`mailto:${request.contactEmail}`}
                    className="text-primary hover:underline"
                  >
                    {request.contactEmail}
                  </a>
                </div>
                {request.contactPhone && (
                  <div>
                    <span className="text-muted">Телефон: </span>
                    <a
                      href={`tel:${request.contactPhone}`}
                      className="text-primary hover:underline"
                    >
                      {request.contactPhone}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-muted">Дата: </span>
                  {new Date(request.createdAt).toLocaleDateString("uk-UA", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                {request.payment && (
                  <div>
                    <span className="text-muted">Оплата: </span>
                    <span className="font-medium">
                      {request.payment.amount} грн
                    </span>
                    {request.payment.status === "SUCCESS" && (
                      <span className="ml-1 text-green-600 text-xs">
                        (оплачено)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Form data */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="text-sm font-semibold text-primary mb-4">
                Дані клієнта
              </h2>
              <div className="text-sm space-y-1 max-h-[400px] overflow-y-auto">
                <FormDataDisplay data={request.partyData} />
              </div>
            </div>

            {/* PDF link */}
            {request.pdfUrl && (
              <div className="bg-white rounded-2xl border border-border p-6">
                <h2 className="text-sm font-semibold text-primary mb-3">
                  PDF документ
                </h2>
                <a
                  href={request.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-primary hover:bg-accent-hover transition"
                >
                  Завантажити PDF
                </a>
              </div>
            )}
          </div>

          {/* Right: Document text editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Generated text */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-primary">
                  Текст документа
                </h2>
                {isEditable && (
                  <span className="text-xs text-muted">
                    Ви можете редагувати текст
                  </span>
                )}
              </div>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                disabled={!isEditable}
                rows={24}
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition"
                placeholder="Згенерований текст документа з'явиться тут..."
              />
            </div>

            {/* Lawyer notes */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="text-sm font-semibold text-primary mb-3">
                Нотатки адвоката
              </h2>
              <textarea
                value={lawyerNotes}
                onChange={(e) => setLawyerNotes(e.target.value)}
                disabled={!isEditable}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition"
                placeholder="Ваші нотатки (не видно клієнту)..."
              />
            </div>

            {/* Actions */}
            {isEditable && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 text-sm font-semibold rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                >
                  {saving ? "Зберігаю..." : "Зберегти зміни"}
                </button>
                {canApprove && (
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="px-6 py-3 text-sm font-bold rounded-xl bg-accent text-primary hover:bg-accent-hover hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {approving
                      ? "Затверджую..."
                      : "Затвердити та відправити клієнту"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function FormDataDisplay({ data }: { data: Record<string, unknown> }) {
  if (!data || typeof data !== "object") return null;

  return (
    <>
      {Object.entries(data).map(([key, value]) => {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          return (
            <div key={key} className="mt-3 first:mt-0">
              <div className="font-medium text-primary mb-1 capitalize">
                {formatLabel(key)}
              </div>
              <div className="pl-3 border-l-2 border-border space-y-1">
                <FormDataDisplay data={value as Record<string, unknown>} />
              </div>
            </div>
          );
        }

        return (
          <div key={key} className="flex gap-2">
            <span className="text-muted shrink-0">{formatLabel(key)}:</span>
            <span className="text-primary">{String(value ?? "—")}</span>
          </div>
        );
      })}
    </>
  );
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}
