import Link from "next/link";

const serviceLinks = [
  { href: "/services", label: "Всі послуги" },
  { href: "/services#consultation", label: "Юридичні консультації" },
  { href: "/services#court", label: "Судове представництво" },
  { href: "/services#documents", label: "Складання документів" },
];

const companyLinks = [
  { href: "/about", label: "Про адвоката" },
  { href: "/about#experience", label: "Як це працює" },
];

export function Footer() {
  return (
    <footer className="bg-[#111] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-baseline gap-0.5 mb-4">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                LAW
              </span>
              <span className="relative text-2xl font-extrabold tracking-tight text-white">
                AK
                <span className="absolute -bottom-0.5 left-0 h-[3px] w-full bg-accent rounded-full" />
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Професійна юридична допомога. Захист ваших прав та інтересів на
              найвищому рівні.
            </p>
          </div>

          {/* Послуги */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-5">
              Послуги
            </h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-accent transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Компанія */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-5">
              Компанія
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-accent transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Контакти */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-5">
              Контакти
            </h3>
            <ul className="space-y-3 text-sm text-white/50">
              <li>
                <a
                  href="tel:+380956728005"
                  className="hover:text-accent transition-colors duration-200"
                >
                  +38 (095) 672-80-05
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/k_anastasiya_i/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors duration-200"
                >
                  @k_anastasiya_i
                </a>
              </li>
              <li>м. Львів, Україна</li>
            </ul>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; 2026 LAWAK. Всі права захищені.
          </p>
          <p className="text-xs text-white/25">
            Розробка та дизайн сайту
          </p>
        </div>
      </div>
    </footer>
  );
}
