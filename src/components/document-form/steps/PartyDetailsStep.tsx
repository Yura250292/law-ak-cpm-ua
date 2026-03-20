"use client";

import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import type { DocumentFormData } from "@/lib/validations";

interface PartyDetailsStepProps {
  form: UseFormReturn<DocumentFormData>;
}

export default function PartyDetailsStep({ form }: PartyDetailsStepProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-8">
      {/* Позивач */}
      <section>
        <h3 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-border">
          Позивач
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="ПІБ позивача *"
            placeholder="Іванов Іван Іванович"
            error={errors.plaintiff?.fullName?.message}
            {...register("plaintiff.fullName")}
          />
          <Input
            label="Дата народження *"
            type="date"
            error={errors.plaintiff?.birthDate?.message}
            {...register("plaintiff.birthDate")}
          />
          <Input
            label="Адреса реєстрації *"
            placeholder="м. Київ, вул. Хрещатик, 1, кв. 1"
            error={errors.plaintiff?.registrationAddress?.message}
            {...register("plaintiff.registrationAddress")}
          />
          <Input
            label="Фактична адреса проживання"
            placeholder="Якщо відрізняється від реєстрації"
            error={errors.plaintiff?.actualAddress?.message}
            {...register("plaintiff.actualAddress")}
          />
          <Input
            label="Номер телефону *"
            type="tel"
            placeholder="+380XXXXXXXXX"
            error={errors.plaintiff?.phone?.message}
            {...register("plaintiff.phone")}
          />
          <Input
            label="ІПН (за наявності)"
            placeholder="1234567890"
            error={errors.plaintiff?.ipn?.message}
            {...register("plaintiff.ipn")}
          />
        </div>
      </section>

      {/* Відповідач */}
      <section>
        <h3 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-border">
          Відповідач
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="ПІБ відповідача *"
            placeholder="Петров Петро Петрович"
            error={errors.defendant?.fullName?.message}
            {...register("defendant.fullName")}
          />
          <Input
            label="Дата народження"
            type="date"
            error={errors.defendant?.birthDate?.message}
            {...register("defendant.birthDate")}
          />
          <Input
            label="Адреса реєстрації *"
            placeholder="м. Київ, вул. Лесі Українки, 5, кв. 10"
            error={errors.defendant?.registrationAddress?.message}
            {...register("defendant.registrationAddress")}
          />
          <Input
            label="Фактична адреса проживання"
            placeholder="Якщо відрізняється від реєстрації"
            error={errors.defendant?.actualAddress?.message}
            {...register("defendant.actualAddress")}
          />
          <Input
            label="Номер телефону"
            type="tel"
            placeholder="+380XXXXXXXXX"
            error={errors.defendant?.phone?.message}
            {...register("defendant.phone")}
          />
        </div>
      </section>
    </div>
  );
}
