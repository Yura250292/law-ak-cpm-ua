import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="text-center">
          <p className="text-8xl font-bold text-border sm:text-9xl">404</p>
          <h1 className="mt-6 text-2xl font-bold text-primary sm:text-3xl">
            Сторінку не знайдено
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-muted">
            На жаль, сторінка, яку ви шукаєте, не існує або була переміщена.
          </p>
          <div className="mt-10">
            <Link href="/">
              <Button className="rounded-xl bg-accent px-8 py-3 text-base font-semibold text-primary transition-all duration-200 hover:bg-accent/90 hover:shadow-lg">
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
