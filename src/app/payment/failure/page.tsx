import Link from "next/link";

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Помилка оплати
        </h1>

        <p className="text-gray-600 mb-8">
          На жаль, оплата не пройшла. Будь ласка, спробуйте ще раз або
          зверніться до служби підтримки.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full inline-block bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Спробувати ще раз
          </Link>

          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            Повернутися на головну
          </Link>
        </div>
      </div>
    </div>
  );
}
