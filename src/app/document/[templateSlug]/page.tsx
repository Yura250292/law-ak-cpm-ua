import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DocumentWizard } from "@/components/document-form/DocumentWizard";
import { FAQSection } from "@/components/FAQSection";
import { divorceFAQ, alimonyFAQ, damagesFAQ, servicesFAQ } from "@/lib/faq-data";
import type { FAQItem } from "@/lib/faq-data";

interface PageProps {
  params: Promise<{ templateSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { templateSlug } = await params;
  const template = await prisma.documentTemplate.findUnique({
    where: { slug: templateSlug },
  });

  if (!template) return {};

  return {
    title: template.title,
    description: template.description,
  };
}

const faqBySlug: Record<string, FAQItem[]> = {
  "pozov-pro-rozirvannnya-shlyubu": divorceFAQ,
  "pozov-pro-stygnennya-alimentiv": alimonyFAQ,
  "pozov-pro-vidshkoduvannya-shkody": damagesFAQ,
};

export default async function DocumentPage({ params }: PageProps) {
  const { templateSlug } = await params;

  const template = await prisma.documentTemplate.findUnique({
    where: { slug: templateSlug },
  });

  if (!template) {
    notFound();
  }

  const faqItems = faqBySlug[templateSlug] ?? servicesFAQ;

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-primary py-12 text-white sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold sm:text-4xl">
              {template.title}
            </h1>
            {template.description && (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60">
                {template.description}
              </p>
            )}
            <div className="mt-6">
              <span className="inline-block rounded-xl bg-accent px-4 py-2 text-lg font-bold text-primary">
                {template.price} грн
              </span>
            </div>
          </div>
        </section>

        {/* Form section */}
        <section className="bg-surface py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <DocumentWizard templateId={template.id} templateTitle={template.title} templateSlug={template.slug} />
          </div>
        </section>

        {/* FAQ section */}
        <FAQSection
          title="Часті запитання"
          subtitle="Відповіді на найпоширеніші питання"
          items={faqItems}
        />
      </main>

      <Footer />
    </>
  );
}
