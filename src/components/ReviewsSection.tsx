import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";

const featuredReviews = [
  {
    name: "Олена К.",
    text: "Зверталася з приводу розірвання шлюбу. Анастасія дуже уважно вислухала мою ситуацію, пояснила всі нюанси процесу та підготувала документи швидко і якісно. Дуже вдячна за професійний підхід!",
    rating: 5,
    service: "Розірвання шлюбу",
  },
  {
    name: "Тарас М.",
    text: "Потрібна була допомога зі стягненням аліментів. Ситуація була непроста, бо колишня дружина переїхала в інше місто. Анастасія Ігорівна все зробила дистанційно, пояснювала кожен крок. Результат позитивний!",
    rating: 5,
    service: "Стягнення аліментів",
  },
  {
    name: "Ірина В.",
    text: "Замовляла позовну заяву про відшкодування моральної шкоди після ДТП. Документ підготовлений грамотно, з посиланнями на актуальне законодавство. Суд задовольнив позов повністю. Рекомендую!",
    rating: 5,
    service: "Відшкодування шкоди",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-accent" : "text-border"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewsSection() {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
            ВІДГУКИ
          </p>
          <h2 className="text-3xl font-bold text-primary sm:text-4xl">
            Що кажуть клієнти
          </h2>
          <p className="mt-4 text-lg text-muted">
            Реальні відгуки людей, яким я допомогла вирішити юридичні питання
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredReviews.map((review, idx) => (
            <Card key={idx} className="flex flex-col">
              <CardHeader>
                <div className="mb-3 flex items-center justify-between">
                  <StarRating rating={review.rating} />
                  <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-medium text-muted">
                    {review.service}
                  </span>
                </div>
                <CardTitle className="text-base">{review.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm leading-relaxed text-muted">
                  &ldquo;{review.text}&rdquo;
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-primary bg-transparent px-8 py-3 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white"
          >
            Всі відгуки
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ReviewsSection;
