import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Контакти */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Контакти</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a href="tel:+380XXXXXXXXX" className="hover:text-white transition-colors">
                  +380 (XX) XXX-XX-XX
                </a>
              </li>
              <li>
                <a href="mailto:info@example.com" className="hover:text-white transition-colors">
                  info@example.com
                </a>
              </li>
              <li>м. Київ, вул. Прикладна, 1</li>
            </ul>
          </div>

          {/* Послуги */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Послуги</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Всі послуги
                </Link>
              </li>
              <li>
                <Link href="/services#consultation" className="hover:text-white transition-colors">
                  Юридичні консультації
                </Link>
              </li>
              <li>
                <Link href="/services#court" className="hover:text-white transition-colors">
                  Судове представництво
                </Link>
              </li>
              <li>
                <Link href="/services#documents" className="hover:text-white transition-colors">
                  Складання документів
                </Link>
              </li>
            </ul>
          </div>

          {/* Про нас */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Про нас</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Про юриста
                </Link>
              </li>
              <li>
                <Link href="/about#experience" className="hover:text-white transition-colors">
                  Досвід роботи
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-white/20 text-center text-sm text-white/60">
          &copy; 2026 Юридичні послуги. Всі права захищені.
        </div>
      </div>
    </footer>
  );
}
