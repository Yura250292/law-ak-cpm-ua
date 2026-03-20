"use client";

import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { DocumentFormData } from "@/lib/validations";

interface RequirementsStepProps {
  form: UseFormReturn<DocumentFormData>;
}

export default function RequirementsStep({ form }: RequirementsStepProps) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    // demands is a string[], useFieldArray needs object array — use a workaround
    name: "demands" as never,
  });

  return (
    <div className="space-y-6">
      {/* Вимоги */}
      <section>
        <h3 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-border">
          Позовні вимоги
        </h3>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex-1">
                <Input
                  label={`Вимога ${index + 1}`}
                  placeholder="Наприклад: Розірвати шлюб між позивачем та відповідачем"
                  error={
                    Array.isArray(errors.demands)
                      ? errors.demands[index]?.message
                      : undefined
                  }
                  {...register(`demands.${index}` as const)}
                />
              </div>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-7 shrink-0 rounded-lg p-2.5 text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Видалити вимогу"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {typeof errors.demands?.message === "string" && (
            <p className="text-sm text-red-600">{errors.demands.message}</p>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append("" as never)}
          >
            + Додати вимогу
          </Button>
        </div>
      </section>

      {/* Суд */}
      <section>
        <h3 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-border">
          Суд та контакти
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Назва суду *"
            placeholder="Шевченківський районний суд м. Києва"
            error={errors.courtName?.message}
            {...register("courtName")}
          />
          <Input
            label="Email для зв'язку *"
            type="email"
            placeholder="example@mail.com"
            error={errors.contactEmail?.message}
            {...register("contactEmail")}
          />
          <Input
            label="Телефон для зв'язку"
            type="tel"
            placeholder="+380XXXXXXXXX"
            error={errors.contactPhone?.message}
            {...register("contactPhone")}
          />
        </div>
      </section>

      {/* Додаткові нотатки */}
      <section>
        <Textarea
          label="Додаткові зауваження"
          placeholder="Будь-яка додаткова інформація, яка може бути корисною..."
          rows={4}
          error={errors.additionalNotes?.message}
          {...register("additionalNotes")}
        />
      </section>
    </div>
  );
}
