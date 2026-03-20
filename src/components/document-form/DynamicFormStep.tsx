"use client";

import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import type { FormField } from "@/lib/form-configs";

interface DynamicFormStepProps {
  fields: FormField[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

/** Resolve a dot-path error from form errors object (e.g. "plaintiff.fullName") */
function getNestedError(
  errors: Record<string, unknown>,
  path: string,
): string | undefined {
  const parts = path.split(".");
  let current: unknown = errors;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  if (current && typeof current === "object" && "message" in current) {
    return (current as { message?: string }).message;
  }
  return undefined;
}

/** Determine the group prefix for section headers */
function getGroupKey(name: string): string | null {
  if (name.startsWith("plaintiff.")) return "plaintiff";
  if (name.startsWith("defendant.")) return "defendant";
  return null;
}

const GROUP_LABELS: Record<string, string> = {
  plaintiff: "Позивач",
  defendant: "Відповідач",
};

export default function DynamicFormStep({ fields, form }: DynamicFormStepProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  // Group fields into sections: grouped (plaintiff/defendant) and ungrouped
  const sections: { groupKey: string | null; fields: FormField[] }[] = [];
  let currentGroupKey: string | null | undefined = undefined;

  for (const field of fields) {
    const gk = getGroupKey(field.name);
    if (gk !== currentGroupKey) {
      sections.push({ groupKey: gk, fields: [field] });
      currentGroupKey = gk;
    } else {
      sections[sections.length - 1].fields.push(field);
    }
  }

  const renderField = (field: FormField) => {
    // Conditional visibility
    if (field.showWhen) {
      const watchedValue = watch(field.showWhen);
      // For select fields, show when the value equals "fixed" (special case for alimentFixedAmount)
      // For checkboxes/booleans, show when truthy
      if (!watchedValue) return null;
    }

    const fieldError = getNestedError(
      errors as unknown as Record<string, unknown>,
      field.name,
    );
    const labelText = field.label + (field.required ? " *" : "");

    switch (field.type) {
      case "text":
        return (
          <div key={field.name}>
            <Input
              label={labelText}
              placeholder={field.placeholder}
              error={fieldError}
              {...register(field.name, {
                required: field.required ? "Обов'язкове поле" : false,
              })}
            />
            {field.hint && (
              <p className="mt-1 text-xs text-muted">{field.hint}</p>
            )}
          </div>
        );

      case "date":
        return (
          <div key={field.name}>
            <Input
              label={labelText}
              type="date"
              placeholder={field.placeholder}
              error={fieldError}
              {...register(field.name, {
                required: field.required ? "Обов'язкове поле" : false,
              })}
            />
            {field.hint && (
              <p className="mt-1 text-xs text-muted">{field.hint}</p>
            )}
          </div>
        );

      case "email":
        return (
          <div key={field.name}>
            <Input
              label={labelText}
              type="email"
              placeholder={field.placeholder}
              error={fieldError}
              {...register(field.name, {
                required: field.required ? "Обов'язкове поле" : false,
                pattern: field.required
                  ? { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Невірний формат email" }
                  : undefined,
              })}
            />
            {field.hint && (
              <p className="mt-1 text-xs text-muted">{field.hint}</p>
            )}
          </div>
        );

      case "phone":
        return (
          <div key={field.name}>
            <Input
              label={labelText}
              type="tel"
              placeholder={field.placeholder}
              error={fieldError}
              {...register(field.name, {
                required: field.required ? "Обов'язкове поле" : false,
              })}
            />
            {field.hint && (
              <p className="mt-1 text-xs text-muted">{field.hint}</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="md:col-span-2">
            <Textarea
              label={labelText}
              placeholder={field.placeholder}
              rows={4}
              error={fieldError}
              {...register(field.name, {
                required: field.required ? "Обов'язкове поле" : false,
                minLength: field.min
                  ? { value: field.min, message: `Мінімум ${field.min} символів` }
                  : undefined,
              })}
            />
            {field.hint && (
              <p className="mt-1 text-xs text-muted">{field.hint}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.name} className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer py-2">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-border text-accent focus:ring-accent-light accent-[#F5C518] cursor-pointer"
                {...register(field.name)}
              />
              <span className="text-sm font-medium text-primary">
                {field.label}
              </span>
            </label>
            {field.hint && (
              <p className="ml-8 text-xs text-muted">{field.hint}</p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={field.name}>
            <Select
              label={labelText}
              placeholder="Оберіть..."
              options={field.options ?? []}
              error={fieldError}
              {...register(field.name, {
                required: field.required ? "Обов'язкове поле" : false,
              })}
            />
            {field.hint && (
              <p className="mt-1 text-xs text-muted">{field.hint}</p>
            )}
          </div>
        );

      case "currency":
        return (
          <div key={field.name}>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">
                {labelText}
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder={field.placeholder}
                  className={`w-full h-12 rounded-xl border bg-white px-4 pr-14 text-sm text-primary placeholder:text-muted-light transition-all duration-200 outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
                    fieldError
                      ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                      : "border-border hover:border-muted-light"
                  }`}
                  {...register(field.name, {
                    required: field.required ? "Обов'язкове поле" : false,
                  })}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted">
                  грн
                </span>
              </div>
              {fieldError && (
                <p className="text-xs text-red-500 mt-1">{fieldError}</p>
              )}
            </div>
            {field.hint && (
              <p className="mt-1 text-xs text-muted">{field.hint}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {sections.map((section, sIdx) => {
        const isGrouped = section.groupKey !== null;
        const groupLabel = section.groupKey
          ? GROUP_LABELS[section.groupKey]
          : null;

        return (
          <section key={sIdx}>
            {isGrouped && groupLabel && (
              <div className="border-l-2 border-accent pl-4 mb-4">
                <h3 className="text-lg font-bold text-primary">{groupLabel}</h3>
              </div>
            )}
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                isGrouped ? "pl-4 border-l-2 border-accent/20" : ""
              }`}
            >
              {section.fields.map(renderField)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
