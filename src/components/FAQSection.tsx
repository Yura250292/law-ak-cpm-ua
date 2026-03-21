import { FAQ } from "@/components/FAQ";
import type { FAQItem } from "@/lib/faq-data";

interface FAQSectionProps {
  title: string;
  subtitle?: string;
  items: FAQItem[];
  className?: string;
}

export function FAQSection({
  title,
  subtitle,
  items,
  className = "",
}: FAQSectionProps) {
  return (
    <section className={`bg-white py-20 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-primary sm:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-lg text-muted">{subtitle}</p>
          )}
        </div>
        <FAQ items={items} />
      </div>
    </section>
  );
}

export default FAQSection;
