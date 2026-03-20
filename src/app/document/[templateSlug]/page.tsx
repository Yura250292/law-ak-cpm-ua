import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DocumentWizard } from "@/components/document-form/DocumentWizard";

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

export default async function DocumentPage({ params }: PageProps) {
  const { templateSlug } = await params;

  const template = await prisma.documentTemplate.findUnique({
    where: { slug: templateSlug },
  });

  if (!template) {
    notFound();
  }

  return (
    <>
      <Header />

      <main className="flex-1 bg-surface">
        {/* Hero section */}
        <section className="bg-primary text-white py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">{template.title}</h1>
            {template.description && (
              <p className="text-white/80 max-w-2xl text-sm sm:text-base leading-relaxed">
                {template.description}
              </p>
            )}
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium">
              <span>Вартість:</span>
              <span className="text-lg font-bold">{template.price} грн</span>
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <DocumentWizard templateId={template.id} templateTitle={template.title} />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
