"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Головна" },
  { href: "/services", label: "Послуги" },
  { href: "/about", label: "Про адвоката" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-baseline gap-0.5">
            <span className="text-2xl font-extrabold tracking-tight text-primary">
              LAW
            </span>
            <span className="relative text-2xl font-extrabold tracking-tight text-primary">
              AK
              <span className="absolute -bottom-0.5 left-0 h-[3px] w-full bg-accent rounded-full" />
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
        className={`fixed inset-0 top-16 z-40 md:hidden transition-visibility ${
          mobileOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
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

            <div className="mt-6 pt-6 border-t border-border">
              <Link
                href="/services"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full px-5 py-3 text-sm font-semibold rounded-md bg-accent text-primary transition-all duration-200 hover:bg-accent-hover active:scale-[0.97]"
              >
                Замовити
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
