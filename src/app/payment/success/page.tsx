import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function PaymentSuccessPage() {
  return (
    <>
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="w-full max-w-md text-center">
          {/* Green checkmark circle */}
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
            Оплата успішна!
          </h1>

          <p className="mt-4 text-base text-muted">
            Дякуємо за оплату. Ваш документ буде згенеровано та відправлено на
            вказану електронну пошту.
          </p>

          <p className="mt-2 text-sm text-muted/60">
            Зазвичай це займає від 1 до 5 хвилин. Перевірте також папку
            &quot;Спам&quot;.
          </p>

          <div className="mt-10">
            <Link href="/">
              <Button className="rounded-xl bg-accent px-8 py-3 font-semibold text-primary transition-all duration-200 hover:bg-accent/90 hover:shadow-lg">
                На головну
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
