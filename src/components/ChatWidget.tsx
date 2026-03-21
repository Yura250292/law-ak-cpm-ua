"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const GREETING =
  "Вітаю! Я AI-асистент адвоката Кабаль Анастасії. Можу допомогти з попередньою оцінкою вашої ситуації, підказати які документи потрібні, або направити до потрібної послуги. Опишіть вашу ситуацію.";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Вибачте, сталася помилка з'єднання. Спробуйте ще раз пізніше.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Chat toggle button - positioned above TelegramButton */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Закрити чат" : "Відкрити AI-асистент"}
        className="fixed bottom-[5.5rem] right-4 sm:bottom-24 sm:right-6 z-40 flex items-center justify-center
          w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
          rounded-full bg-primary text-white
          shadow-lg hover:scale-110 transition-transform duration-200"
      >
        {isOpen ? (
          /* Close icon */
          <svg
            className="w-7 h-7 md:w-8 md:h-8"
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
        ) : (
          /* Chat icon */
          <svg
            className="w-7 h-7 md:w-8 md:h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Chat window */}
      <div
        className={`fixed z-50 transition-all duration-300 ease-in-out
          ${
            isOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          }
          bottom-24 right-3 sm:bottom-40 sm:right-6
          w-[calc(100vw-1.5rem)] sm:w-[350px]
          h-[min(400px,calc(100dvh-8rem))]
          flex flex-col
          rounded-2xl shadow-2xl overflow-hidden
          border border-border bg-white`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary text-white shrink-0">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="font-semibold text-sm">
              Юридичний AI-асистент
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Закрити чат"
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <svg
              className="w-5 h-5"
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
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-accent/20 text-foreground rounded-br-md"
                    : "bg-surface text-foreground rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-surface rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-muted animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-muted animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-muted animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick action */}
        <div className="px-4 pb-2 shrink-0">
          <Link
            href="/consultation"
            onClick={() => setIsOpen(false)}
            className="block w-full text-center text-xs font-medium py-2 rounded-lg
              bg-accent/15 text-primary hover:bg-accent/30 transition-colors"
          >
            Записатися на консультацію
          </Link>
        </div>

        {/* Input area */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Напишіть ваше запитання..."
            className="flex-1 min-w-0 rounded-lg border border-border bg-surface px-3 py-2 text-sm
              placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            aria-label="Надіслати"
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg
              bg-primary text-white
              hover:bg-primary-light transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
