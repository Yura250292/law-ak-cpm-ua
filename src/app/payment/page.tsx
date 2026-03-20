"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface PaymentData {
  data: string;
  signature: string;
  orderId: string;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      setError("Не вказано ID запиту");
      setLoading(false);
      return;
    }

    async function fetchPaymentData() {
      try {
        const res = await fetch("/api/payment/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentRequestId: requestId }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Помилка створення платежу");
        }

        const data: PaymentData = await res.json();
        setPaymentData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Невідома помилка");
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentData();
  }, [requestId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Підготовка платежу...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Помилка</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            На головну
          </a>
        </div>
      </div>
    );
  }

  if (!paymentData) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Оплата документа
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Замовлення: {paymentData.orderId}
        </p>

        <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
          <p className="text-sm text-gray-500 mb-1">До сплати</p>
          <p className="text-3xl font-bold text-gray-900">
            {/* Price is encoded in LiqPay data, displayed on LiqPay side */}
            Перейти до оплати
          </p>
        </div>

        <form
          method="POST"
          action="https://www.liqpay.ua/api/3/checkout"
          acceptCharset="utf-8"
        >
          <input type="hidden" name="data" value={paymentData.data} />
          <input type="hidden" name="signature" value={paymentData.signature} />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors cursor-pointer"
          >
            Оплатити
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Оплата захищена сервісом LiqPay. Після оплати документ буде
          відправлено на вашу електронну пошту.
        </p>
      </div>
    </div>
  );
}
