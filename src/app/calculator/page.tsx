import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import CourtFeeCalculator from "@/components/CourtFeeCalculator";

export const metadata: Metadata = {
  title: "Калькулятор судового збору 2026 | LAWAK",
  description:
    "Онлайн калькулятор судового збору в Україні на 2026 рік. Розрахуйте розмір судового збору для майнових, немайнових вимог, розірвання шлюбу, аліментів, апеляційних та касаційних скарг.",
  keywords:
    "судовий збір, калькулятор, розрахунок судового збору, Україна 2026, прожитковий мінімум",
};

export default function CalculatorPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold sm:text-5xl">
              Калькулятор судового збору
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/60">
              Розрахуйте розмір судового збору відповідно до Закону України
              &laquo;Про судовий збір&raquo; з урахуванням ставок на 2026 рік.
            </p>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <CourtFeeCalculator />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
