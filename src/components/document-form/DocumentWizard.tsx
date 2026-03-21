"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { getFormConfig, getDefaultValues } from "@/lib/form-configs";
import { getTestData } from "@/lib/test-data";
import StepIndicator from "./StepIndicator";
import DynamicFormStep from "./DynamicFormStep";
import FormSummary from "./FormSummary";
import { Button } from "@/components/ui/Button";

interface DocumentWizardProps {
  templateId: string;
  templateTitle: string;
  templateSlug: string;
}

export function DocumentWizard({
  templateId,
  templateTitle,
  templateSlug,
}: DocumentWizardProps) {
  const router = useRouter();
  const config = getFormConfig(templateSlug);
  const STEPS = [...config.steps.map((s) => s.title), "Підтвердження"];

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: getDefaultValues(config),
    mode: "onTouched",
  });

  const handleNext = async () => {
    if (currentStep < config.stepValidationFields.length) {
      const fieldsToValidate = config.stepValidationFields[currentStep];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = await form.trigger(fieldsToValidate as any);
      if (!isValid) return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isValid = await form.trigger(config.stepValidationFields.flat() as any);
    if (!isValid) {
      // Find the first step with errors and go back to it
      for (let i = 0; i < config.stepValidationFields.length; i++) {
        const stepFields = config.stepValidationFields[i];
        for (const fieldName of stepFields) {
          const parts = fieldName.split(".");
          let errorObj: unknown = form.formState.errors;
          for (const part of parts) {
            if (errorObj && typeof errorObj === "object") {
              errorObj = (errorObj as Record<string, unknown>)[part];
            } else {
              errorObj = undefined;
              break;
            }
          }
          if (errorObj) {
            setCurrentStep(i);
            return;
          }
        }
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = form.getValues();

      const payload = {
        templateId,
        templateSlug,
        formData,
        contactEmail: formData.contactEmail ?? "",
        contactPhone: formData.contactPhone ?? "",
      };

      const response = await fetch("/api/document-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error || "Помилка при відправленні заявки",
        );
      }

      const result = await response.json();
      router.push(`/payment/success?requestId=${result.documentRequestId}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Сталася невідома помилка. Спробуйте ще раз.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillTestData = () => {
    const data = getTestData(templateSlug);
    if (!data) return;
    form.reset(data);
    setCurrentStep(STEPS.length - 1); // Go straight to confirmation
  };

  const isLastStep = currentStep === STEPS.length - 1;
  const isFormStep = currentStep < config.steps.length;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Dev: fill test data */}
      {process.env.NODE_ENV !== "production" || true ? (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={fillTestData}
            className="text-xs text-muted hover:text-primary border border-dashed border-border rounded-lg px-3 py-1.5 transition-colors hover:border-accent hover:bg-accent/5"
          >
            🧪 Заповнити тестовими даними
          </button>
        </div>
      ) : null}

      <StepIndicator currentStep={currentStep} steps={STEPS} />

      <div className="rounded-xl border border-border bg-white p-6 sm:p-8 shadow-sm">
        {/* Step title and description */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-primary">
            {STEPS[currentStep]}
          </h2>
          {isFormStep && config.steps[currentStep]?.description && (
            <p className="mt-1 text-sm text-muted">
              {config.steps[currentStep].description}
            </p>
          )}
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          {isFormStep ? (
            <DynamicFormStep
              fields={config.steps[currentStep].fields}
              form={form}
            />
          ) : (
            <FormSummary
              data={form.getValues() as Record<string, unknown>}
              config={config}
            />
          )}

          {submitError && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            {currentStep > 0 ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                Назад
              </Button>
            ) : (
              <div />
            )}

            {isLastStep ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Відправлення..." : "Підтвердити та оплатити"}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Далі
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
