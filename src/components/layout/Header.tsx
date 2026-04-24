"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
  { href: "/", label: "Головна" },
  { href: "/services", label: "Послуги" },
  { href: "/practices", label: "Спеціалізації" },
  { href: "/consultation", label: "Консультація" },
  { href: "/calculator", label: "Калькулятор" },
  { href: "/blog", label: "Блог" },
  { href: "/about", label: "Про адвоката" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-[70] bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <Image
              src="/logo-mark.svg"
              alt="Кабаль Анастасія — адвокат"
              width={42}
              height={42}
              priority
              className="transition-transform duration-300 group-hover:scale-105"
            />
            <span className="hidden sm:flex flex-col leading-tight">
              <span className="font-display text-[15px] font-semibold tracking-wide text-primary">
                Кабаль Анастасія
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
                Адвокат · Львів
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm tracking-wide transition-colors duration-200 py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 ${
                  isActive(link.href)
                    ? "text-primary font-semibold after:w-full"
                    : "text-muted font-medium hover:text-primary after:w-0 hover:after:w-full"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Кабінет */}
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary transition-colors duration-200"
              aria-label="Кабінет"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
              </svg>
              Кабінет
            </button>

            {/* CTA */}
            <Link
              href="/services"
              className="ml-2 inline-flex items-center px-5 py-2 text-sm font-semibold rounded-md bg-accent text-primary transition-all duration-200 hover:bg-accent-hover hover:shadow-md active:scale-[0.97]"
            >
              Замовити
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden relative flex flex-col justify-center items-center w-10 h-10 gap-[5px]"
            aria-label={mobileOpen ? "Закрити меню" : "Відкрити меню"}
          >
            <span
              className={`block h-[2px] w-6 bg-primary rounded-full transition-all duration-300 origin-center ${
                mobileOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-6 bg-primary rounded-full transition-all duration-300 ${
                mobileOpen ? "opacity-0 scale-x-0" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-6 bg-primary rounded-full transition-all duration-300 origin-center ${
                mobileOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile slide-in nav */}
      <div
        className={`fixed inset-0 top-16 z-[60] md:hidden transition-all duration-300 ${
          mobileOpen
            ? "visible opacity-100"
            : "invisible opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Panel */}
        <nav
          className={`absolute right-0 top-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col p-6 pt-8 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 py-3 px-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-primary bg-surface"
                    : "text-muted hover:text-primary hover:bg-surface/60"
                }`}
              >
                <span
                  className={`h-5 w-[3px] rounded-full transition-colors duration-200 ${
                    isActive(link.href)
                      ? "bg-accent"
                      : "bg-transparent group-hover:bg-accent/40"
                  }`}
                />
                {link.label}
              </Link>
            ))}

            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <Link
                href="/services"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full px-5 py-3 text-sm font-semibold rounded-md bg-accent text-primary transition-all duration-200 hover:bg-accent-hover active:scale-[0.97]"
              >
                Замовити
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setLoginOpen(true);
                }}
                className="flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-medium rounded-md border border-border text-primary hover:bg-surface transition-all duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                </svg>
                Кабінет
              </button>
            </div>
          </div>
        </nav>
      </div>

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </header>
  );
}

function LoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Помилка авторизації");
        return;
      }
      onClose();
      router.push("/admin");
    } catch {
      setError("Помилка з'єднання");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-border p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрити"
          className="absolute top-3 right-3 w-8 h-8 inline-flex items-center justify-center rounded-full text-muted hover:bg-surface hover:text-primary transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-baseline gap-0.5 mb-1">
            <span className="text-2xl font-extrabold tracking-tight text-primary">LAW</span>
            <span className="relative text-2xl font-extrabold tracking-tight text-primary">
              AK
              <span className="absolute -bottom-0.5 left-0 h-[3px] w-full bg-accent rounded-full" />
            </span>
          </div>
          <p className="text-muted text-sm">Вхід у кабінет</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cab-email" className="block text-sm font-medium text-primary mb-1.5">
              Email
            </label>
            <input
              id="cab-email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="cab-password" className="block text-sm font-medium text-primary mb-1.5">
              Пароль
            </label>
            <input
              id="cab-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-accent text-primary font-bold rounded-xl hover:bg-accent-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? "Вхід..." : "Увійти"}
          </button>
        </form>
      </div>
    </div>
  );
}
