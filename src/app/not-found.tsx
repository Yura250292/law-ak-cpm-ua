import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="text-center">
          <p className="text-7xl font-bold text-accent sm:text-9xl">404</p>
          <h1 className="mt-6 text-3xl font-bold text-primary sm:text-4xl">
            Сторінку не знайдено
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted">
            На жаль, сторінка, яку ви шукаєте, не існує або була переміщена.
          </p>
          <div className="mt-8">
            <Link href="/">
              <Button>Повернутися на головну</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
