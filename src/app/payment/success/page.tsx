import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Оплата пройшла успішно!
        </h1>

        <p className="text-gray-600 mb-2">
          Дякуємо за оплату. Ваш документ буде згенеровано та відправлено на
          вказану електронну пошту.
        </p>

        <p className="text-sm text-gray-500 mb-8">
          Зазвичай це займає від 1 до 5 хвилин. Перевірте також папку
          &quot;Спам&quot;.
        </p>

        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          На головну
        </Link>
      </div>
    </div>
  );
}
