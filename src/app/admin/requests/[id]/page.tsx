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
  legalSources: string | null;
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
  GENERATING: "Генерація AI",
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

const FIELD_LABELS: Record<string, string> = {
  fullName: "ПІБ",
  birthDate: "Дата народження",
  ipn: "ІПН",
  registrationAddress: "Адреса реєстрації",
  actualAddress: "Фактична адреса",
  phone: "Телефон",
  workplace: "Місце роботи",
  position: "Посада",
  edrpou: "Код ЄДРПОУ",
  marriageDate: "Дата реєстрації шлюбу",
  marriagePlace: "Місце реєстрації шлюбу",
  separationDate: "Дата припинення спільного проживання",
  hasChildren: "Є спільні неповнолітні діти",
  childrenDetails: "Дані дітей",
  childResidence: "З ким мають проживати діти",
  hasProperty: "Є питання поділу майна",
  propertyDetails: "Опис спільного майна",
  divorceReason: "Причина розірвання шлюбу",
  courtName: "Назва суду",
  additionalDemands: "Додаткові вимоги",
  childName: "ПІБ дитини",
  childBirthDate: "Дата народження дитини",
  childBirthCertificate: "Свідоцтво про народження",
  divorceDate: "Дата розірвання шлюбу",
  childLivesWithPlaintiff: "Дитина проживає з позивачем",
  defendantDoesNotSupport: "Відповідач не утримує дитину",
  childNeeds: "Щомісячні витрати на дитину",
  defendantIncome: "Відомості про доходи відповідача",
  alimentType: "Спосіб стягнення аліментів",
  alimentFixedAmount: "Сума аліментів (грн/міс)",
  incidentDate: "Дата інциденту",
  incidentPlace: "Місце інциденту",
  incidentDescription: "Опис обставин",
  damageType: "Вид шкоди",
  materialDamageAmount: "Сума матеріальної шкоди",
  materialDamageDetails: "Розрахунок матеріальної шкоди",
  moralDamageAmount: "Сума моральної шкоди",
  moralDamageJustification: "Обґрунтування моральної шкоди",
  totalCompensation: "Загальна сума позову",
  evidence: "Наявні докази",
};

const SECTION_LABELS: Record<string, string> = {
  plaintiff: "Позивач",
  defendant: "Відповідач",
  child: "Дитина",
  court: "Суд",
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
  const [deleting, setDeleting] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
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
        body: JSON.stringify({ generatedText: editedText, lawyerNotes }),
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
        "Затвердити документ та відправити клієнту?\n\nТекст буде конвертовано в PDF та відправлено на email клієнта."
      )
    )
      return;

    setApproving(true);
    setMessage(null);
    try {
      await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generatedText: editedText, lawyerNotes }),
      });

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
      await fetchRequest();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Помилка затвердження",
      });
    } finally {
      setApproving(false);
    }
  }

  async function handleGeneratePdf() {
    setGeneratingPdf(true);
    setMessage(null);
    try {
      // Save latest edits first
      await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generatedText: editedText, lawyerNotes }),
      });

      const res = await fetch(`/api/admin/requests/${id}/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generatedText: editedText }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Помилка генерації PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers
          .get("Content-Disposition")
          ?.match(/filename="(.+)"/)?.[1] ?? "document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({
        type: "success",
        text: "PDF сформовано та завантажується!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Помилка генерації PDF",
      });
    } finally {
      setGeneratingPdf(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Ви впевнені, що хочете видалити цю заявку?\n\nЦю дію неможливо скасувати."
      )
    )
      return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.push("/admin");
    } catch {
      setMessage({ type: "error", text: "Помилка видалення" });
      setDeleting(false);
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
          <Link href="/admin" className="text-sm text-accent hover:underline">
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
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-white/70 hover:text-white transition text-sm"
            >
              &larr; До заявок
            </Link>
            <div className="hidden sm:block h-4 w-px bg-white/20" />
            <span className="text-sm font-medium truncate max-w-[300px]">
              {request.template.title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                STATUS_COLORS[request.status] ?? "bg-gray-100 text-gray-700"
              }`}
            >
              {STATUS_LABELS[request.status] ?? request.status}
            </span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-300 hover:text-red-100 transition text-sm disabled:opacity-50"
              title="Видалити заявку"
            >
              {deleting ? "..." : "Видалити"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Message */}
        {message && (
          <div
            className={`mb-5 px-5 py-3 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* ══════ LEFT: Client data ══════ */}
          <div className="space-y-5">
            {/* Client contact */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-primary uppercase tracking-wide">
                  Інформація про клієнта
                </h2>
                <span className="text-xs text-muted">
                  {new Date(request.createdAt).toLocaleDateString("uk-UA", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <InfoItem
                  label="Email"
                  value={request.contactEmail}
                  href={`mailto:${request.contactEmail}`}
                />
                {request.contactPhone && (
                  <InfoItem
                    label="Телефон"
                    value={request.contactPhone}
                    href={`tel:${request.contactPhone}`}
                  />
                )}
                <InfoItem
                  label="Документ"
                  value={request.template.title}
                />
                <InfoItem
                  label="Категорія"
                  value={request.template.category}
                />
                {request.payment && (
                  <>
                    <InfoItem
                      label="Оплата"
                      value={`${request.payment.amount} грн`}
                    />
                    <InfoItem
                      label="Статус оплати"
                      value={
                        request.payment.status === "SUCCESS"
                          ? "Оплачено"
                          : request.payment.status
                      }
                    />
                  </>
                )}
              </div>
            </div>

            {/* Form data — structured display */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-4">
                Вхідні дані (заповнені клієнтом)
              </h2>
              <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                <FormDataStructured data={request.partyData} />
              </div>
            </div>

            {/* PDF link */}
            {request.pdfUrl && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3">
                  Готовий PDF
                </h2>
                <a
                  href={request.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Завантажити PDF
                </a>
              </div>
            )}
          </div>

          {/* ══════ RIGHT: AI result + editor ══════ */}
          <div className="space-y-5">
            {/* AI suggestion header */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide">
                    Рішення AI-помічника
                  </h2>
                  <p className="text-xs text-muted mt-1">
                    Текст згенерований AI на основі даних клієнта. Перевірте посилання на статті та відредагуйте за потреби.
                  </p>
                </div>
                {isEditable && (
                  <span className="shrink-0 px-2.5 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                    Редагується
                  </span>
                )}
              </div>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                disabled={!isEditable}
                rows={28}
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition"
                placeholder="Згенерований текст документа з'явиться тут..."
              />
            </div>

            {/* Legal Sources — only for lawyer */}
            {request.legalSources && (
              <SourcesPanel sources={request.legalSources} />
            )}

            {/* Lawyer notes */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3">
                Нотатки адвоката
              </h2>
              <p className="text-xs text-muted mb-2">
                Внутрішні нотатки — клієнт їх не бачить
              </p>
              <textarea
                value={lawyerNotes}
                onChange={(e) => setLawyerNotes(e.target.value)}
                disabled={!isEditable}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition"
                placeholder="Ваші нотатки..."
              />
            </div>

            {/* Actions */}
            {isEditable && (
              <div className="sticky bottom-4 bg-white rounded-2xl border border-border p-4 shadow-lg">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl border-2 border-primary text-primary bg-white hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                  >
                    {saving ? "Зберігаю..." : "Зберегти зміни"}
                  </button>
                  <button
                    onClick={handleGeneratePdf}
                    disabled={generatingPdf}
                    className="px-5 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary-light transition-all disabled:opacity-50"
                  >
                    {generatingPdf
                      ? "Формую PDF..."
                      : "Сформувати та завантажити PDF"}
                  </button>
                  {canApprove && (
                    <button
                      onClick={handleApprove}
                      disabled={approving}
                      className="px-5 py-2.5 text-sm font-bold rounded-xl bg-accent text-primary hover:bg-accent-hover hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {approving
                        ? "Затверджую..."
                        : "Затвердити та відправити клієнту"}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted mt-2">
                  Сформуйте PDF для перевірки. Після затвердження документ буде відправлено клієнту на email.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Helper Components ── */

function InfoItem({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="bg-surface rounded-lg px-3 py-2.5">
      <div className="text-[11px] text-muted uppercase tracking-wider mb-0.5">
        {label}
      </div>
      {href ? (
        <a
          href={href}
          className="text-sm font-medium text-primary hover:underline"
        >
          {value}
        </a>
      ) : (
        <div className="text-sm font-medium text-primary">{value}</div>
      )}
    </div>
  );
}

function FormDataStructured({ data }: { data: Record<string, unknown> }) {
  if (!data || typeof data !== "object") return null;

  const sections: Record<string, Record<string, unknown>> = {};
  const topLevel: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      sections[key] = value as Record<string, unknown>;
    } else {
      topLevel[key] = value;
    }
  }

  return (
    <>
      {/* Sections (plaintiff, defendant, etc.) */}
      {Object.entries(sections).map(([sectionKey, sectionData]) => (
        <div
          key={sectionKey}
          className="border border-border rounded-xl overflow-hidden"
        >
          <div className="bg-surface px-4 py-2 border-b border-border">
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
              {SECTION_LABELS[sectionKey] ?? formatLabel(sectionKey)}
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {Object.entries(sectionData).map(([key, value]) => (
              <FieldRow key={key} fieldKey={key} value={value} />
            ))}
          </div>
        </div>
      ))}

      {/* Top-level fields */}
      {Object.keys(topLevel).length > 0 && (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="bg-surface px-4 py-2 border-b border-border">
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
              Обставини справи
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {Object.entries(topLevel).map(([key, value]) => (
              <FieldRow key={key} fieldKey={key} value={value} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function FieldRow({
  fieldKey,
  value,
}: {
  fieldKey: string;
  value: unknown;
}) {
  if (value === null || value === undefined || value === "") return null;

  const label = FIELD_LABELS[fieldKey] ?? formatLabel(fieldKey);
  let displayValue: string;

  if (typeof value === "boolean") {
    displayValue = value ? "Так" : "Ні";
  } else {
    displayValue = String(value);
  }

  const isLong = displayValue.length > 80;

  return (
    <div className={isLong ? "" : "flex items-start gap-2"}>
      <span className="text-xs text-muted shrink-0 min-w-[140px]">
        {label}:
      </span>
      <span
        className={`text-sm text-primary ${
          isLong ? "block mt-1 bg-surface rounded-lg px-3 py-2" : ""
        }`}
      >
        {displayValue}
      </span>
    </div>
  );
}

function SourcesPanel({ sources }: { sources: string }) {
  const [expanded, setExpanded] = useState(false);

  // Parse sources into sections
  const sections = parseSources(sources);

  return (
    <div className="bg-amber-50 rounded-2xl border border-amber-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-amber-100/50 transition"
      >
        <div>
          <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wide">
            Джерела та правовий аналіз
          </h2>
          <p className="text-xs text-amber-700 mt-0.5">
            Тільки для адвоката — не потрапляє в PDF
          </p>
        </div>
        <span className="text-amber-600 text-lg shrink-0 ml-3">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4">
          {sections.map((section, i) => (
            <div key={i}>
              {section.title && (
                <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              <div className="text-sm text-amber-950 leading-relaxed whitespace-pre-wrap bg-white/60 rounded-xl px-4 py-3 border border-amber-200/50">
                {section.content}
              </div>
            </div>
          ))}

          {sections.length === 0 && (
            <div className="text-sm text-amber-950 leading-relaxed whitespace-pre-wrap bg-white/60 rounded-xl px-4 py-3">
              {sources}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function parseSources(
  text: string
): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];

  // Try to split by section markers: А), Б), В), Г) or A), B), etc.
  const sectionRegex =
    /^[А-ГA-D]\)\s+(.+?)$/gm;
  const matches = [...text.matchAll(sectionRegex)];

  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index! + matches[i][0].length;
      const end =
        i + 1 < matches.length ? matches[i + 1].index! : text.length;
      sections.push({
        title: matches[i][1].replace(/:$/, "").trim(),
        content: text.substring(start, end).trim(),
      });
    }
  }

  return sections;
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}
