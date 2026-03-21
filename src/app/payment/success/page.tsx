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
    const maxAttempts = 30;

    const poll = async () => {
      try {
        const res = await fetch(`/api/document-request/${requestId}`);
        if (!res.ok) throw new Error("Не вдалося отримати статус");

        const data: DocumentResult = await res.json();
        setResult(data);

        // Terminal states
        if (
          data.status === "COMPLETED" ||
          data.status === "PENDING_REVIEW" ||
          data.status === "FAILED"
        ) {
          setLoading(false);
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          setLoading(false);
          return;
        }

        setTimeout(poll, 2000);
      } catch {
        setLoading(false);
        setError("Помилка при отриманні статусу заявки");
      }
    };

    poll();
  }, [requestId]);

  const isSuccess =
    !loading &&
    (result?.status === "COMPLETED" ||
      result?.status === "PENDING_REVIEW");

  return (
    <>
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="w-full max-w-lg text-center">
          {/* Loading — заявка обробляється */}
          {loading && (
            <>
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
              </div>
              <h1 className="text-2xl font-bold text-primary">
                Обробляємо вашу заявку...
              </h1>
              <p className="mt-4 text-base text-muted">
                Зачекайте, будь ласка. Ваші дані передаються адвокату для підготовки документа.
              </p>
            </>
          )}

          {/* Успіх — заявку прийнято */}
          {isSuccess && (
            <>
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-primary">
                Заявку прийнято!
              </h1>

              <p className="mt-4 text-base text-muted">
                Ваш запит на підготовку документа{" "}
                <strong>&ldquo;{result!.templateTitle}&rdquo;</strong>{" "}
                прийнято в роботу.
              </p>

              <div className="mt-6 rounded-2xl bg-surface border border-border p-6 text-left">
                <h3 className="text-sm font-semibold text-primary mb-3">
                  Що далі?
                </h3>
                <ol className="space-y-3 text-sm text-muted">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary">
                      1
                    </span>
                    <span>
                      Адвокат перегляне ваші дані та підготує документ
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary">
                      2
                    </span>
                    <span>
                      Документ буде перевірено на відповідність законодавству
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary">
                      3
                    </span>
                    <span>
                      Готовий документ буде надіслано на вашу пошту{" "}
                      {result!.contactEmail && (
                        <strong>{result!.contactEmail}</strong>
                      )}
                    </span>
                  </li>
                </ol>
              </div>

              <p className="mt-6 text-sm text-muted/60">
                Зазвичай підготовка документа займає від 1 до 24 годин у робочі дні.
                Якщо у вас є питання — зв&apos;яжіться з нами.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4">
                <Link href="/services">
                  <Button variant="outline">Замовити інший документ</Button>
                </Link>
                <Link
                  href="/"
                  className="text-sm text-muted hover:text-primary transition-colors"
                >
                  На головну
                </Link>
              </div>
            </>
          )}

          {/* Помилка */}
          {!loading && (result?.status === "FAILED" || error) && (
            <>
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-10 w-10 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-primary">
                Виникла помилка
              </h1>

              <p className="mt-4 text-base text-muted">
                {error ||
                  "Не вдалося обробити вашу заявку. Спробуйте ще раз або зверніться до адвоката."}
              </p>

              <div className="mt-10 flex flex-col items-center gap-4">
                <Link href="/services">
                  <Button>Спробувати ще раз</Button>
                </Link>
                <Link
                  href="/"
                  className="text-sm text-muted hover:text-primary transition-colors"
                >
                  На головну
                </Link>
              </div>
            </>
          )}

          {/* Без requestId */}
          {!requestId && !loading && (
            <>
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-primary">Дякуємо!</h1>

              <p className="mt-4 text-base text-muted">
                Вашу заявку прийнято. Адвокат підготує документ та надішле його
                на вашу електронну пошту.
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
