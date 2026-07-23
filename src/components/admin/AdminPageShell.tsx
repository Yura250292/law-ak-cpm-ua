"use client";

import Link from "next/link";

/** Спільна оболонка адмін-сторінок керування контентом. */
export function AdminPageShell({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 bg-primary text-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="text-sm text-white/70 hover:text-white">
            ← Адмін-панель
          </Link>
          <span className="text-sm font-semibold">{title}</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}

export default AdminPageShell;
