import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function PaymentFailurePage() {
  return (
    <>
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="w-full max-w-md text-center">
          {/* Red X circle */}
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

          <h1 className="text-3xl font-bold text-primary">
            Оплата не пройшла
          </h1>

          <p className="mt-4 text-base text-muted">
            На жаль, оплата не пройшла. Спробуйте ще раз або зверніться до
            служби підтримки.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <Link href="/services">
              <Button className="rounded-xl bg-accent px-8 py-3 font-semibold text-primary transition-all duration-200 hover:bg-accent/90 hover:shadow-lg">
                Спробувати ще раз
              </Button>
            </Link>

            <Link
              href="/"
              className="text-sm text-muted transition-colors duration-200 hover:text-primary"
            >
              Повернутися на головну
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
