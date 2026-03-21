"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

interface DocumentResult {
  id: string;
  status: string;
  templateTitle: string;
  pdfUrl: string | null;
  generatedText: string | null;
  contactEmail: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  const [result, setResult] = useState<DocumentResult | null>(null);
  const [loading, setLoading] = useState(!!requestId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;

    let attempts = 0;
    const maxAttempts = 30; // 30 * 2s = 60 seconds max

    const poll = async () => {
      try {
        const res = await fetch(`/api/document-request/${requestId}`);
        if (!res.ok) throw new Error("Не вдалося отримати статус");

        const data: DocumentResult = await res.json();
        setResult(data);

        if (data.status === "COMPLETED" || data.status === "FAILED") {
          setLoading(false);
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          setLoading(false);
          setError("Генерація займає більше часу, ніж очікувалось. Спробуйте оновити сторінку.");
          return;
        }

        setTimeout(poll, 2000);
      } catch {
        setLoading(false);
        setError("Помилка при отриманні статусу документа");
      }
    };

    poll();
  }, [requestId]);

  const handleDownloadPdf = async () => {
    if (!result?.pdfUrl) return;

    try {
      const res = await fetch(result.pdfUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.templateTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(result.pdfUrl, "_blank");
    }
  };

  return (
    <>
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="w-full max-w-lg text-center">
          {/* Loading state */}
          {loading && (
            <>
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
              </div>
              <h1 className="text-2xl font-bold text-primary">
                Генеруємо ваш документ...
              </h1>
              <p className="mt-4 text-base text-muted">
                AI формує юридичний текст та створює PDF. Це може зайняти до хвилини.
              </p>
              {result?.status && (
                <p className="mt-2 text-sm text-muted/60">
                  Статус: {result.status === "GENERATING" ? "Генерація тексту..." : result.status === "DRAFT" ? "Обробка..." : result.status}
                </p>
              )}
            </>
          )}

          {/* Success state */}
          {!loading && result?.status === "COMPLETED" && (
            <>
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-primary">
                Документ готовий!
              </h1>

              <p className="mt-4 text-base text-muted">
                <strong>&ldquo;{result.templateTitle}&rdquo;</strong> успішно згенеровано.
              </p>

              {result.contactEmail && (
                <p className="mt-2 text-sm text-muted/60">
                  Також відправлено на {result.contactEmail}
                </p>
              )}

              <div className="mt-10 flex flex-col items-center gap-4">
                {result.pdfUrl && (
                  <Button size="lg" onClick={handleDownloadPdf}>
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Завантажити PDF
                  </Button>
                )}

                <Link href="/services">
                  <Button variant="outline">
                    Замовити інший документ
                  </Button>
                </Link>

                <Link href="/" className="text-sm text-muted hover:text-primary transition-colors">
                  На головну
                </Link>
              </div>
            </>
          )}

          {/* Error / Failed state */}
          {!loading && (result?.status === "FAILED" || error) && (
            <>
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-primary">
                Виникла помилка
              </h1>

              <p className="mt-4 text-base text-muted">
                {error || "Не вдалося згенерувати документ. Спробуйте ще раз або зверніться до підтримки."}
              </p>

              <div className="mt-10 flex flex-col items-center gap-4">
                <Link href="/services">
                  <Button>Спробувати ще раз</Button>
                </Link>
                <Link href="/" className="text-sm text-muted hover:text-primary transition-colors">
                  На головну
                </Link>
              </div>
            </>
          )}

          {/* No requestId */}
          {!requestId && !loading && (
            <>
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-primary">Дякуємо!</h1>

              <p className="mt-4 text-base text-muted">
                Ваш документ буде відправлено на вказану електронну пошту.
              </p>

              <div className="mt-10">
                <Link href="/">
                  <Button>На головну</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
