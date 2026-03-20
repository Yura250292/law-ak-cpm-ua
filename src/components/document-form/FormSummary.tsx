"use client";

import type { TemplateFormConfig } from "@/lib/form-configs";

interface FormSummaryProps {
  data: Record<string, unknown>;
  config: TemplateFormConfig;
}

/** Resolve a dot-path value from a nested object (e.g. "plaintiff.fullName") */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function formatDisplayValue(value: unknown, fieldType: string): string | null {
  if (value === undefined || value === null || value === "") return null;

  if (fieldType === "checkbox") {
    return value ? "Так" : "Ні";
  }
  if (fieldType === "currency") {
    return `${value} грн`;
  }
  return String(value);
}

function SummaryField({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 py-1.5">
      <dt className="text-xs font-medium text-muted uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-sm text-primary">{value}</dd>
    </div>
  );
}

export default function FormSummary({ data, config }: FormSummaryProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Перевірте введені дані перед відправленням. За потреби поверніться на
        попередній крок для внесення змін.
      </p>

      {config.steps.map((step, stepIdx) => {
        // Check if any field in this step has a displayable value
        const hasAnyValue = step.fields.some((field) => {
          const val = getNestedValue(data, field.name);
          return val !== undefined && val !== null && val !== "" && val !== false;
        });

        if (!hasAnyValue) return null;

        return (
          <section key={stepIdx} className="space-y-2">
            <h4 className="text-base font-semibold text-primary border-b border-border pb-2">
              {step.title}
            </h4>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              {step.fields.map((field) => {
                const rawValue = getNestedValue(data, field.name);
                const displayValue = formatDisplayValue(rawValue, field.type);

                // For select fields, show the option label instead of the raw value
                if (field.type === "select" && field.options && rawValue) {
                  const option = field.options.find(
                    (o) => o.value === String(rawValue),
                  );
                  if (option) {
                    return (
                      <SummaryField
                        key={field.name}
                        label={field.label}
                        value={option.label}
                      />
                    );
                  }
                }

                // Textarea fields span full width
                if (field.type === "textarea" && displayValue) {
                  return (
                    <div key={field.name} className="md:col-span-2">
                      <SummaryField label={field.label} value={displayValue} />
                    </div>
                  );
                }

                return (
                  <SummaryField
                    key={field.name}
                    label={field.label}
                    value={displayValue}
                  />
                );
              })}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
