"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";

const consultationTypes = [
  { value: "blitz", label: "Бліц-консультація (15 хв) — 300 грн" },
  { value: "standard", label: "Стандартна консультація (30 хв) — 500 грн" },
  { value: "extended", label: "Розширена консультація (60 хв) — 900 грн" },
];

const timeSlots = Array.from({ length: 10 }, (_, i) => {
  const hour = 9 + i;
  const time = `${hour.toString().padStart(2, "0")}:00`;
  return { value: time, label: time };
});

const topics = [
  { value: "family", label: "Сімейне право" },
  { value: "civil", label: "Цивільне право" },
  { value: "commercial", label: "Господарське право" },
  { value: "administrative", label: "Адміністративне право" },
  { value: "other", label: "Інше" },
];

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function ConsultationForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      consultationType: fd.get("consultationType"),
      preferredDate: fd.get("preferredDate"),
      preferredTime: fd.get("preferredTime"),
      topic: fd.get("topic"),
      description: fd.get("description"),
    };

    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Помилка при відправці заявки");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка при відправці заявки");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center sm:p-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mb-2 text-2xl font-bold text-primary">Дякуємо!</h3>
        <p className="text-muted">
          Заявку прийнято! Ми зв&apos;яжемося з вами для підтвердження.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8"
    >
      <h3 className="mb-6 text-xl font-bold text-primary">Записатися на консультацію</h3>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="name" label="Ім'я та прізвище" placeholder="Іван Іванов" required />
        <Input name="phone" label="Телефон" type="tel" placeholder="+380 XX XXX XX XX" required />
        <Input
          name="email"
          label="Email"
          type="email"
          placeholder="example@email.com"
          required
          className="sm:col-span-2"
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Select
          name="consultationType"
          label="Тип консультації"
          options={consultationTypes}
          placeholder="Оберіть тип"
          defaultValue=""
          required
        />
        <Select
          name="topic"
          label="Тема"
          options={topics}
          placeholder="Оберіть тему"
          defaultValue=""
          required
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Input
          name="preferredDate"
          label="Бажана дата"
          type="date"
          min={getTomorrow()}
          required
        />
        <Select
          name="preferredTime"
          label="Бажаний час"
          options={timeSlots}
          placeholder="Оберіть час"
          defaultValue=""
          required
        />
      </div>

      <div className="mt-5">
        <Textarea
          name="description"
          label="Короткий опис питання"
          placeholder="Опишіть вашу ситуацію у кількох реченнях..."
          rows={4}
        />
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-6">
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Надсилання..." : "Надіслати заявку"}
        </Button>
      </div>
    </form>
  );
}
