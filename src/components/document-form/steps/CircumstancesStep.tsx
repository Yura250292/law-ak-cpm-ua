"use client";

import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { DocumentFormData } from "@/lib/validations";

interface CircumstancesStepProps {
  form: UseFormReturn<DocumentFormData>;
}

export default function CircumstancesStep({ form }: CircumstancesStepProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const hasChildren = watch("hasChildren");
  const hasProperty = watch("hasProperty");

  return (
    <div className="space-y-6">
      {/* Шлюб */}
      <section>
        <h3 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-border">
          Інформація про шлюб
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Дата реєстрації шлюбу *"
            type="date"
            error={errors.marriageDate?.message}
            {...register("marriageDate")}
          />
          <Input
            label="Місце реєстрації шлюбу *"
            placeholder="Відділ РАЦС Шевченківського р-ну м. Києва"
            error={errors.marriagePlace?.message}
            {...register("marriagePlace")}
          />
          <Input
            label="Дата фактичного припинення шлюбних відносин"
            type="date"
            error={errors.separationDate?.message}
            {...register("separationDate")}
          />
        </div>
      </section>

      {/* Діти */}
      <section>
        <h3 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-border">
          Діти
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-border text-accent focus:ring-accent-light"
              {...register("hasChildren")}
            />
            <span className="text-sm font-medium text-primary">
              Є спільні неповнолітні діти
            </span>
          </label>

          {hasChildren && (
            <Textarea
              label="Відомості про дітей"
              placeholder="ПІБ, дата народження кожної дитини"
              rows={3}
              error={errors.childrenDetails?.message}
              {...register("childrenDetails")}
            />
          )}
        </div>
      </section>

      {/* Майно */}
      <section>
        <h3 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-border">
          Спільне майно
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-border text-accent focus:ring-accent-light"
              {...register("hasProperty")}
            />
            <span className="text-sm font-medium text-primary">
              Є спільне майно, яке потребує поділу
            </span>
          </label>

          {hasProperty && (
            <Textarea
              label="Опис спільного майна"
              placeholder="Квартира за адресою..., автомобіль марки..."
              rows={3}
              error={errors.propertyDetails?.message}
              {...register("propertyDetails")}
            />
          )}
        </div>
      </section>

      {/* Обставини */}
      <section>
        <Textarea
          label="Обставини справи *"
          placeholder="Детально опишіть обставини, що стали підставою для подання позову..."
          rows={6}
          error={errors.circumstances?.message}
          {...register("circumstances")}
        />
      </section>
    </div>
  );
}
