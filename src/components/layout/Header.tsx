"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Головна" },
  { href: "/services", label: "Послуги" },
  { href: "/about", label: "Про адвоката" },
  { href: "/reviews", label: "Відгуки та кейси" },
  { href: "/contact", label: "Контакти" },
  { href: "/samples", label: "Зразки документів" },
  { href: "/blog", label: "Статті" },
];

// ── Contact details ──
const PHONE_DISPLAY = "+38 (095) 67-28-005";
const PHONE_HREF = "tel:+380956728005";
const EMAIL = "advocate.kabal.a@gmail.com";
const EMAIL_HREF = `mailto:${EMAIL}`;
const ADDRESS_DISPLAY = "м. Львів, вул. Федьковича, 58, літ. А-5";
const MAPS_HREF = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "Львів, вул. Федьковича, 58"
)}`;

const PhoneIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const MailIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const PinIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
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
      {/* ── Top contact bar ── */}
      <div className="bg-primary text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-1.5 px-4 py-2 text-[12.5px] sm:justify-end sm:px-6 lg:px-8">
          <a
            href={PHONE_HREF}
            className="inline-flex items-center gap-1.5 text-white/85 transition-colors hover:text-accent"
          >
            <span className="text-accent"><PhoneIcon /></span>
            <span className="font-medium">{PHONE_DISPLAY}</span>
          </a>
          <a
            href={EMAIL_HREF}
            className="inline-flex items-center gap-1.5 text-white/85 transition-colors hover:text-accent"
          >
            <span className="text-accent"><MailIcon /></span>
            <span>{EMAIL}</span>
          </a>
          <a
            href={MAPS_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 text-white/85 transition-colors hover:text-accent md:inline-flex"
          >
            <span className="text-accent"><PinIcon /></span>
            <span>{ADDRESS_DISPLAY}</span>
          </a>
        </div>
      </div>

      {/* ── Main bar ── */}
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
          <nav className="hidden lg:flex items-center gap-6">
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
              href="/consultation"
              className="ml-2 inline-flex items-center px-5 py-2 text-sm font-semibold rounded-md bg-accent text-primary transition-all duration-200 hover:bg-accent-hover hover:shadow-md active:scale-[0.97]"
            >
              Записатись на консультацію
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden relative flex flex-col justify-center items-center w-10 h-10 gap-[5px]"
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
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
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
          className={`absolute right-0 top-0 h-full w-72 overflow-y-auto bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
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
                href="/consultation"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full px-5 py-3 text-sm font-semibold rounded-md bg-accent text-primary transition-all duration-200 hover:bg-accent-hover active:scale-[0.97]"
              >
                Записатись на консультацію
              </Link>
            </div>

            {/* Contact block */}
            <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm">
              <a href={PHONE_HREF} className="flex items-center gap-2.5 text-muted hover:text-accent transition-colors">
                <span className="text-accent"><PhoneIcon /></span>
                {PHONE_DISPLAY}
              </a>
              <a href={EMAIL_HREF} className="flex items-center gap-2.5 text-muted hover:text-accent transition-colors">
                <span className="text-accent"><MailIcon /></span>
                <span className="break-all">{EMAIL}</span>
              </a>
              <a
                href={MAPS_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 text-muted hover:text-accent transition-colors"
              >
                <span className="mt-0.5 text-accent"><PinIcon /></span>
                {ADDRESS_DISPLAY}
              </a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
