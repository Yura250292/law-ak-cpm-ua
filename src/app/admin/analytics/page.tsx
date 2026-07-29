"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DailyPoint {
  date: string;
  views: number;
  visitors: number;
  sessions: number;
}

interface NamedCount {
  name: string;
  count: number;
  label?: string;
}

interface AnalyticsData {
  range: number;
  summary: {
    views: number;
    visitors: number;
    sessions: number;
    viewsToday: number;
    visitorsToday: number;
    avgPerDay: number;
    viewsPerSession: number;
    bounceRate: number;
    avgDuration: number;
    viewsChange: number | null;
    visitorsChange: number | null;
  };
  daily: DailyPoint[];
  pages: NamedCount[];
  sources: NamedCount[];
  devices: NamedCount[];
  browsers: NamedCount[];
  countries: NamedCount[];
  hours: { hour: number; views: number }[];
}

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Комп'ютер",
  mobile: "Телефон",
  tablet: "Планшет",
  bot: "Бот",
};

const RANGES = [
  { value: 7, label: "7 днів" },
  { value: 14, label: "14 днів" },
  { value: 30, label: "30 днів" },
  { value: 90, label: "90 днів" },
];

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} с`;
  return `${m} хв ${s.toString().padStart(2, "0")} с`;
}

function formatDay(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [range, setRange] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? `Помилка сервера (${res.status})`);
        return;
      }
      setData(await res.json());
      setError(null);
    } catch {
      setError("Не вдалося завантажити статистику");
    } finally {
      setLoading(false);
    }
  }, [range, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-primary text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-white/70 hover:text-white transition">
              &larr; Панель
            </Link>
            <span className="text-xs text-white/60 hidden sm:block">Аналітика</span>
          </div>
          <button
            onClick={fetchData}
            className="text-sm text-accent hover:text-accent-hover transition font-medium"
          >
            Оновити
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">Відвідування сайту</h1>
            <p className="text-sm text-muted mt-1">
              Власна статистика без cookie та зовнішніх сервісів
            </p>
          </div>
          <div className="flex gap-2">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  range === r.value
                    ? "bg-primary text-white"
                    : "bg-white text-muted border border-border hover:bg-surface-dark"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 px-5 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {loading && !data && (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
          </div>
        )}

        {data && (
          <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
            {/* Ключові метрики */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard
                label="Переглядів сьогодні"
                value={data.summary.viewsToday}
                sub={`${data.summary.visitorsToday} відвідувачів`}
                highlight
              />
              <MetricCard
                label={`Переглядів за ${data.range} дн.`}
                value={data.summary.views}
                sub={`≈ ${data.summary.avgPerDay} на день`}
                change={data.summary.viewsChange}
              />
              <MetricCard
                label="Унікальних відвідувачів"
                value={data.summary.visitors}
                sub={`${data.summary.sessions} візитів`}
                change={data.summary.visitorsChange}
              />
              <MetricCard
                label="Середній час на сторінці"
                value={formatDuration(data.summary.avgDuration)}
                sub={`${data.summary.viewsPerSession} стор. за візит`}
              />
            </div>

            {/* Графік по днях */}
            <Panel title="Відвідування по днях" className="mb-6">
              <DailyChart daily={data.daily} />
            </Panel>

            <div className="grid gap-6 lg:grid-cols-2 mb-6">
              <Panel title="Популярні сторінки">
                <BarList
                  items={data.pages.map((p) => ({
                    name: p.label ?? p.name,
                    hint: p.name,
                    count: p.count,
                  }))}
                  empty="Ще немає переглядів"
                />
              </Panel>

              <Panel title="Джерела переходів">
                <BarList
                  items={data.sources.map((s) => ({ name: s.name, count: s.count }))}
                  empty="Ще немає даних"
                />
              </Panel>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 mb-6">
              <Panel title="Пристрої">
                <BarList
                  items={data.devices.map((d) => ({
                    name: DEVICE_LABELS[d.name] ?? d.name,
                    count: d.count,
                  }))}
                  empty="Немає даних"
                />
              </Panel>
              <Panel title="Браузери">
                <BarList
                  items={data.browsers.map((b) => ({ name: b.name, count: b.count }))}
                  empty="Немає даних"
                />
              </Panel>
              <Panel title="Показник відмов">
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="text-4xl font-bold text-primary">
                    {data.summary.bounceRate}%
                  </div>
                  <p className="mt-2 text-center text-xs text-muted">
                    Візити, де переглянули лише одну сторінку
                  </p>
                </div>
              </Panel>
            </div>

            <Panel title="Активність за годинами (UTC)">
              <HourChart hours={data.hours} />
            </Panel>
          </div>
        )}
      </main>
    </div>
  );
}

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-white rounded-2xl border border-border shadow-sm p-5 ${className}`}
    >
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
  sub,
  change,
  highlight,
}: {
  label: string;
  value: string | number;
  sub?: string;
  change?: number | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight ? "bg-primary border-primary" : "bg-white border-border"
      }`}
    >
      <div className={`text-xs mb-1 ${highlight ? "text-white/60" : "text-muted"}`}>
        {label}
      </div>
      <div
        className={`text-2xl font-bold ${highlight ? "text-accent" : "text-primary"}`}
      >
        {typeof value === "number" ? value.toLocaleString("uk-UA") : value}
      </div>
      <div className="mt-1 flex items-center gap-2">
        {sub && (
          <span className={`text-xs ${highlight ? "text-white/50" : "text-muted"}`}>
            {sub}
          </span>
        )}
        {typeof change === "number" && (
          <span
            className={`text-xs font-medium ${
              change >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}

/** Стовпчикова діаграма по днях — чистий CSS, без бібліотек. */
function DailyChart({ daily }: { daily: DailyPoint[] }) {
  const max = Math.max(1, ...daily.map((d) => d.views));
  // При довгих періодах підписуємо не кожен стовпчик, щоб не злипались.
  const labelStep = daily.length > 31 ? 7 : daily.length > 14 ? 3 : 1;

  return (
    <div>
      <div className="flex items-end gap-[3px] h-48">
        {daily.map((day) => (
          <div
            key={day.date}
            className="group relative flex-1 flex justify-end h-full min-w-[3px] items-end gap-px"
          >
            {/* Дві окремі колонки: перегляди (світла) і відвідувачі (темна) —
                вкладені одна в одну читалися б як одна величина. */}
            <div
              className="flex-1 rounded-t bg-accent/30 transition-all group-hover:bg-accent/50"
              style={{
                height: `${(day.views / max) * 100}%`,
                minHeight: day.views ? "2px" : "0",
              }}
            />
            <div
              className="flex-1 rounded-t bg-accent transition-all group-hover:bg-accent-hover"
              style={{
                height: `${(day.visitors / max) * 100}%`,
                minHeight: day.visitors ? "2px" : "0",
              }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-xs text-white shadow-lg group-hover:block">
              <div className="font-medium">{formatDay(day.date)}</div>
              <div className="text-white/70">{day.views} переглядів</div>
              <div className="text-white/70">{day.visitors} відвідувачів</div>
            </div>
          </div>
        ))}
      </div>
      {/* Підписи дат: на телефоні рідші, щоб не злипались. */}
      <DayLabels daily={daily} step={labelStep * 2} className="sm:hidden" />
      <DayLabels daily={daily} step={labelStep} className="hidden sm:flex" />
      <div className="mt-3 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-accent/30" /> Перегляди
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-accent" /> Унікальні відвідувачі
        </span>
      </div>
    </div>
  );
}

function DayLabels({
  daily,
  step,
  className,
}: {
  daily: DailyPoint[];
  step: number;
  className: string;
}) {
  return (
    <div className={`mt-2 gap-[3px] flex ${className}`}>
      {daily.map((day, i) => (
        <div key={day.date} className="flex-1 min-w-[3px] text-center">
          {i % step === 0 && (
            <span className="text-[9px] text-muted-light">
              {formatDay(day.date)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function HourChart({ hours }: { hours: { hour: number; views: number }[] }) {
  const max = Math.max(1, ...hours.map((h) => h.views));
  return (
    <div className="flex items-end gap-1 h-32">
      {hours.map((h) => (
        <div key={h.hour} className="group relative flex-1 flex flex-col justify-end h-full">
          <div
            className="w-full rounded-t bg-primary/70 transition-all group-hover:bg-primary"
            style={{ height: `${(h.views / max) * 100}%`, minHeight: h.views ? "2px" : "0" }}
          />
          <span className="mt-1 text-center text-[9px] text-muted-light">
            {h.hour % 3 === 0 ? h.hour : ""}
          </span>
          <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-primary px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block">
            {h.hour}:00 — {h.views}
          </div>
        </div>
      ))}
    </div>
  );
}

function BarList({
  items,
  empty,
}: {
  items: { name: string; hint?: string; count: number }[];
  empty: string;
}) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">{empty}</p>;
  }
  const max = Math.max(...items.map((i) => i.count));
  const total = items.reduce((sum, i) => sum + i.count, 0);

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.hint ?? item.name} className="relative">
          <div className="relative overflow-hidden rounded-lg bg-surface/60">
            <div
              className="absolute inset-y-0 left-0 bg-accent/20"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
            <div className="relative flex items-center justify-between gap-3 px-3 py-2">
              <span className="truncate text-sm text-primary" title={item.hint ?? item.name}>
                {item.name}
              </span>
              <span className="shrink-0 text-xs font-medium text-muted tabular-nums">
                {item.count.toLocaleString("uk-UA")}
                <span className="ml-1.5 text-muted-light">
                  {Math.round((item.count / total) * 100)}%
                </span>
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
