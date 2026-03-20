"use client";

import type { DocumentFormData } from "@/lib/validations";

interface FormSummaryProps {
  data: DocumentFormData;
}

function SummaryField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 py-1.5">
      <dt className="text-xs font-medium text-muted uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-primary">{value}</dd>
    </div>
  );
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h4 className="text-base font-semibold text-primary border-b border-border pb-2">
        {title}
      </h4>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">{children}</dl>
    </section>
  );
}

export default function FormSummary({ data }: FormSummaryProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Перевірте введені дані перед відправленням. За потреби поверніться на попередній крок для
        внесення змін.
      </p>

      {/* Позивач */}
      <SummarySection title="Позивач">
        <SummaryField label="ПІБ" value={data.plaintiff.fullName} />
        <SummaryField label="Дата народження" value={data.plaintiff.birthDate} />
        <SummaryField label="Адреса реєстрації" value={data.plaintiff.registrationAddress} />
        <SummaryField label="Фактична адреса" value={data.plaintiff.actualAddress} />
        <SummaryField label="Телефон" value={data.plaintiff.phone} />
        <SummaryField label="ІПН" value={data.plaintiff.ipn} />
      </SummarySection>

      {/* Відповідач */}
      <SummarySection title="Відповідач">
        <SummaryField label="ПІБ" value={data.defendant.fullName} />
        <SummaryField label="Дата народження" value={data.defendant.birthDate} />
        <SummaryField label="Адреса реєстрації" value={data.defendant.registrationAddress} />
        <SummaryField label="Фактична адреса" value={data.defendant.actualAddress} />
        <SummaryField label="Телефон" value={data.defendant.phone} />
      </SummarySection>

      {/* Обставини */}
      <SummarySection title="Обставини справи">
        <SummaryField label="Дата реєстрації шлюбу" value={data.marriageDate} />
        <SummaryField label="Місце реєстрації" value={data.marriagePlace} />
        <SummaryField label="Дата припинення відносин" value={data.separationDate} />
        <SummaryField
          label="Спільні діти"
          value={data.hasChildren ? data.childrenDetails || "Так" : "Ні"}
        />
        <SummaryField
          label="Спільне майно"
          value={data.hasProperty ? data.propertyDetails || "Так" : "Ні"}
        />
        <div className="md:col-span-2">
          <SummaryField label="Опис обставин" value={data.circumstances} />
        </div>
      </SummarySection>

      {/* Вимоги */}
      <SummarySection title="Позовні вимоги">
        <div className="md:col-span-2">
          <dt className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Вимоги</dt>
          <dd>
            <ol className="list-decimal list-inside space-y-1">
              {data.demands.map((demand, i) => (
                <li key={i} className="text-sm text-primary">
                  {demand}
                </li>
              ))}
            </ol>
          </dd>
        </div>
        <SummaryField label="Назва суду" value={data.courtName} />
        <SummaryField label="Додаткові зауваження" value={data.additionalNotes} />
      </SummarySection>

      {/* Контакти */}
      <SummarySection title="Контактна інформація">
        <SummaryField label="Email" value={data.contactEmail} />
        <SummaryField label="Телефон" value={data.contactPhone} />
      </SummarySection>
    </div>
  );
}
