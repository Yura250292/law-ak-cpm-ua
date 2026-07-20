import Image from "next/image";
import Link from "next/link";

const serviceLinks = [
  { href: "/services", label: "Всі послуги" },
  { href: "/consultation", label: "Онлайн-консультація" },
  { href: "/samples", label: "Зразки документів" },
  { href: "/contact", label: "Контакти" },
];

const companyLinks = [
  { href: "/about", label: "Про адвоката" },
  { href: "/reviews", label: "Відгуки та кейси" },
  { href: "/blog", label: "Статті" },
  { href: "/consultation", label: "Записатись на консультацію" },
];

export function Footer() {
  return (
    <footer className="bg-primary-dark text-white border-t border-accent/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/logo-plate.svg"
                alt="Кабаль Анастасія Ігорівна — адвокат"
                width={140}
                height={168}
                className="drop-shadow-[0_8px_24px_rgba(201,169,110,0.15)]"
              />
            </Link>
            <p className="text-sm text-white/55 leading-relaxed max-w-xs">
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
                  +38 (095) 67-28-005
                </a>
              </li>
              <li>
                <a
                  href="mailto:advocate.kabal.a@gmail.com"
                  className="break-all hover:text-accent transition-colors duration-200"
                >
                  advocate.kabal.a@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Львів%2C+вул.+Федьковича%2C+58"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors duration-200"
                >
                  м. Львів, вул. Федьковича, 58, літ. А-5
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
            </ul>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; 2026 Адвокат Кабаль Анастасія Ігорівна. Всі права захищені.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/login"
              className="text-xs text-white/25 hover:text-accent transition-colors duration-200"
            >
              Вхід у кабінет
            </Link>
            <span className="text-xs text-white/25">Розробка та дизайн сайту</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
