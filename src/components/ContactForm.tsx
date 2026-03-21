"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";

const subjectOptions = [
  { value: "consultation", label: "Консультація" },
  { value: "documents", label: "Складання документів" },
  { value: "court", label: "Представництво в суді" },
  { value: "other", label: "Інше" },
];

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("consultation");
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Вкажіть ваше ім'я";
    }
    if (!phone.trim()) {
      newErrors.phone = "Вкажіть номер телефону";
    }
    if (!message.trim()) {
      newErrors.message = "Опишіть ваше питання";
    } else if (message.trim().length < 10) {
      newErrors.message = "Повідомлення має містити щонайменше 10 символів";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setFormState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, subject, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Помилка при відправленні повідомлення");
      }

      setFormState("success");
      setName("");
      setPhone("");
      setEmail("");
      setSubject("consultation");
      setMessage("");
      setErrors({});
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Сталася невідома помилка"
      );
    }
  }

  if (formState === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-primary">
          Повідомлення надіслано!
        </h3>
        <p className="mt-2 text-muted">
          Дякую за ваше звернення. Я зв&apos;яжусь з вами найближчим часом.
        </p>
        <button
          onClick={() => setFormState("idle")}
          className="mt-6 text-sm font-medium text-accent underline underline-offset-2 hover:text-accent/80 transition-colors"
        >
          Надіслати ще одне повідомлення
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formState === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Ім'я *"
          placeholder="Ваше ім'я"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          label="Телефон *"
          placeholder="+380 XX XXX XX XX"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Email"
          placeholder="email@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Select
          label="Тема звернення"
          options={subjectOptions}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <Textarea
        label="Повідомлення *"
        placeholder="Опишіть ваше питання або ситуацію..."
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        error={errors.message}
      />

      <div className="pt-2">
        <Button
          type="submit"
          disabled={formState === "submitting"}
          className="w-full sm:w-auto"
        >
          {formState === "submitting" ? "Надсилаю..." : "Надіслати повідомлення"}
        </Button>
      </div>
    </form>
  );
}
