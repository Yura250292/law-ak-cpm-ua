"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { documentFormSchema, type DocumentFormData } from "@/lib/validations";
import StepIndicator from "./StepIndicator";
import PartyDetailsStep from "./steps/PartyDetailsStep";
import CircumstancesStep from "./steps/CircumstancesStep";
import RequirementsStep from "./steps/RequirementsStep";
import FormSummary from "./FormSummary";
import { Button } from "@/components/ui/Button";

const STEPS = ["Сторони", "Обставини", "Вимоги", "Підтвердження"];

/** Fields validated per step for partial validation with form.trigger() */
const STEP_FIELDS: (keyof DocumentFormData | string)[][] = [
  [
    "plaintiff.fullName",
    "plaintiff.birthDate",
    "plaintiff.registrationAddress",
    "plaintiff.phone",
    "defendant.fullName",
    "defendant.registrationAddress",
  ],
  ["marriageDate", "marriagePlace", "circumstances"],
  ["demands", "courtName", "contactEmail"],
];

interface DocumentWizardProps {
  templateId: string;
  templateTitle: string;
}

export function DocumentWizard({ templateId, templateTitle }: DocumentWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      plaintiff: {
        fullName: "",
        birthDate: "",
        registrationAddress: "",
        actualAddress: "",
        phone: "",
        ipn: "",
      },
      defendant: {
        fullName: "",
        birthDate: "",
        registrationAddress: "",
        actualAddress: "",
        phone: "",
      },
      marriageDate: "",
      marriagePlace: "",
      separationDate: "",
      hasChildren: false,
      childrenDetails: "",
      hasProperty: false,
      propertyDetails: "",
      circumstances: "",
      demands: [""],
      courtName: "",
      additionalNotes: "",
      contactEmail: "",
      contactPhone: "",
    },
    mode: "onTouched",
  });

  const handleNext = async () => {
    if (currentStep < STEP_FIELDS.length) {
      const fieldsToValidate = STEP_FIELDS[currentStep];
      const isValid = await form.trigger(fieldsToValidate as never[]);
      if (!isValid) return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const data = form.getValues();

      // Restructure flat form data into API expected format
      const payload = {
        templateId,
        partyData: {
          plaintiff: data.plaintiff,
          defendant: data.defendant,
        },
        circumstancesData: {
          marriageDate: data.marriageDate,
          marriagePlace: data.marriagePlace,
          separationDate: data.separationDate,
          hasChildren: data.hasChildren,
          childrenDetails: data.childrenDetails,
          hasProperty: data.hasProperty,
          propertyDetails: data.propertyDetails,
          circumstances: data.circumstances,
        },
        requirementsData: {
          demands: data.demands,
          courtName: data.courtName,
          additionalNotes: data.additionalNotes,
        },
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
      };

      const response = await fetch("/api/document-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || "Помилка при відправленні заявки");
      }

      const result = await response.json();
      router.push(`/payment/success?requestId=${result.documentRequestId}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Сталася невідома помилка. Спробуйте ще раз."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <PartyDetailsStep form={form} />;
      case 1:
        return <CircumstancesStep form={form} />;
      case 2:
        return <RequirementsStep form={form} />;
      case 3:
        return <FormSummary data={form.getValues()} />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="mx-auto max-w-3xl">
      <StepIndicator currentStep={currentStep} steps={STEPS} />

      <div className="rounded-xl border border-border bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-primary mb-6">
          {STEPS[currentStep]}
        </h2>

        <form onSubmit={(e) => e.preventDefault()}>
          {renderStep()}

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
