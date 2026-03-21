"use client";

export default function TelegramButton() {
  return (
    <a
      href="https://t.me/Kabal_Anastasiya"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Написати в Telegram"
      className="group fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center justify-center
        w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
        rounded-full bg-[var(--accent)] text-[var(--primary)]
        shadow-lg hover:scale-110 transition-transform duration-200
        animate-pulse-ring"
    >
      {/* Telegram paper-plane icon */}
      <svg
        className="w-7 h-7 md:w-8 md:h-8"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
      </svg>

      {/* Tooltip */}
      <span
        className="pointer-events-none absolute right-full mr-3 whitespace-nowrap
          rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm text-[var(--accent)]
          opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        Написати в Telegram
      </span>

      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-40 animate-ping" />

      <style>{`
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 214, 0, 0.5); }
          50% { box-shadow: 0 0 0 12px rgba(255, 214, 0, 0); }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2.5s ease-in-out infinite;
        }
      `}</style>
    </a>
  );
}
