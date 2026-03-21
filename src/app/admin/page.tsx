"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Stats {
  total: number;
  pendingReview: number;
  completed: number;
  revenue: number;
}

interface DocumentRequest {
  id: string;
  status: string;
  contactEmail: string;
  contactPhone: string | null;
  createdAt: string;
  template: {
    title: string;
    slug: string;
    category: string;
  };
}

interface RequestsResponse {
  requests: DocumentRequest[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [data, setData] = useState<RequestsResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", page.toString());

      const [statsRes, requestsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch(`/api/admin/requests?${params}`),
      ]);

      if (statsRes.status === 401 || requestsRes.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      if (requestsRes.ok) {
        setData(await requestsRes.json());
      } else {
        const errData = await requestsRes.json().catch(() => ({}));
        setError(errData.details ?? errData.error ?? `Помилка сервера (${requestsRes.status})`);
      }
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function handleDelete(requestId: string) {
    if (!confirm("Видалити цю заявку? Цю дію неможливо скасувати.")) return;
    try {
      const res = await fetch(`/api/admin/requests/${requestId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      fetchData();
    } catch {
      alert("Помилка видалення");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-primary text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-baseline gap-0.5">
              <span className="text-lg font-extrabold tracking-tight">LAW</span>
              <span className="relative text-lg font-extrabold tracking-tight">
                AK
                <span className="absolute -bottom-0.5 left-0 h-[2px] w-full bg-accent rounded-full" />
              </span>
            </div>
            <span className="text-xs text-white/60 hidden sm:block">
              Адмін-панель
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-white/70 hover:text-white transition"
          >
            Вийти
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error */}
        {error && (
          <div className="mb-6 px-5 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Всього заявок" value={stats.total} />
            <StatCard
              label="На перевірці"
              value={stats.pendingReview}
              highlight={stats.pendingReview > 0}
            />
            <StatCard label="Завершено" value={stats.completed} />
            <StatCard
              label="Дохід"
              value={`${stats.revenue.toLocaleString("uk-UA")} грн`}
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="text-sm font-medium text-muted">Фільтр:</span>
          {["", "PENDING_REVIEW", "COMPLETED", "GENERATING", "FAILED"].map(
            (s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  statusFilter === s
                    ? "bg-primary text-white"
                    : "bg-white text-muted border border-border hover:bg-surface-dark"
                }`}
              >
                {s ? STATUS_LABELS[s] : "Всі"}
              </button>
            )
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    Дата
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    Документ
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    Клієнт
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    Статус
                  </th>
                  <th className="text-right px-5 py-3 font-medium text-muted">
                    Дія
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.requests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-border last:border-0 hover:bg-surface/50 transition"
                  >
                    <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString("uk-UA", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-primary">
                        {req.template.title}
                      </div>
                      <div className="text-xs text-muted">
                        {req.template.category}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>{req.contactEmail}</div>
                      {req.contactPhone && (
                        <div className="text-xs text-muted">
                          {req.contactPhone}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                          STATUS_COLORS[req.status] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {STATUS_LABELS[req.status] ?? req.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/requests/${req.id}`}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-primary hover:bg-accent-hover transition"
                        >
                          Переглянути
                        </Link>
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition"
                        >
                          Видалити
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data?.requests.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-muted"
                    >
                      Заявок не знайдено
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface">
              <span className="text-xs text-muted">
                Сторінка {data.pagination.page} з {data.pagination.totalPages}{" "}
                (всього {data.pagination.total})
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 text-xs rounded-lg border border-border bg-white hover:bg-surface-dark disabled:opacity-40 transition"
                >
                  Назад
                </button>
                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.min(data.pagination.totalPages, p + 1)
                    )
                  }
                  disabled={page >= data.pagination.totalPages}
                  className="px-3 py-1 text-xs rounded-lg border border-border bg-white hover:bg-surface-dark disabled:opacity-40 transition"
                >
                  Далі
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? "bg-orange-50 border-orange-200"
          : "bg-white border-border"
      }`}
    >
      <div className="text-xs text-muted mb-1">{label}</div>
      <div
        className={`text-2xl font-bold ${
          highlight ? "text-orange-600" : "text-primary"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
