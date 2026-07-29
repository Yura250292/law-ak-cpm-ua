"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Клієнтський трекер переглядів. Без cookie: sessionId живе у sessionStorage
// (тобто до закриття вкладки), тому згоди на cookie не потребує.

const SESSION_KEY = "_sid";
const ENDPOINT = "/api/analytics/collect";

function getSessionId(): { id: string; isNew: boolean } {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return { id: existing, isNew: false };
    const id = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
    sessionStorage.setItem(SESSION_KEY, id);
    return { id, isNew: true };
  } catch {
    // Приватний режим / вимкнене сховище — сесія на один перегляд.
    return { id: Math.random().toString(36).slice(2).padEnd(16, "0"), isNew: true };
  }
}

/** Надсилає дані так, щоб вони пережили перехід на іншу сторінку. */
function send(payload: Record<string, unknown>, keepalive = false) {
  const body = JSON.stringify(payload);
  if (keepalive && typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
    return Promise.resolve(null);
  }
  return fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive,
  })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
}

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Актуальні дані поточного перегляду для обробника виходу.
  const viewIdRef = useRef<string | null>(null);
  // 0 до першого ефекту — реальний час старту виставляється там.
  const startedAtRef = useRef<number>(0);
  const sentDurationRef = useRef(false);

  useEffect(() => {
    // Не рахуємо адмінку — це наші власні перегляди.
    if (!pathname || pathname.startsWith("/admin")) return;

    const { id: sessionId, isNew } = getSessionId();
    viewIdRef.current = null;
    startedAtRef.current = Date.now();
    sentDurationRef.current = false;

    let cancelled = false;

    send({
      path: pathname,
      referrer: document.referrer || null,
      sessionId,
      isNewVisit: isNew,
    }).then((res) => {
      if (!cancelled && res && typeof res.viewId === "string") {
        viewIdRef.current = res.viewId;
      }
    });

    const flushDuration = () => {
      if (sentDurationRef.current || !viewIdRef.current) return;
      const duration = Math.round((Date.now() - startedAtRef.current) / 1000);
      if (duration < 1) return;
      sentDurationRef.current = true;
      send({
        path: pathname,
        sessionId,
        viewId: viewIdRef.current,
        duration,
      }, true);
    };

    // pagehide/visibilitychange надійніші за unload на мобільних.
    const onHide = () => {
      if (document.visibilityState === "hidden") flushDuration();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flushDuration);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flushDuration);
      flushDuration(); // перехід на іншу сторінку в межах SPA
    };
    // searchParams — щоб перерахувати перегляд при зміні query.
  }, [pathname, searchParams]);

  return null;
}

export default function Analytics() {
  // useSearchParams вимагає Suspense-межі під час пререндера.
  return (
    <Suspense fallback={null}>
      <AnalyticsTracker />
    </Suspense>
  );
}
