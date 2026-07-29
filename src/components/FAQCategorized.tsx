"use client";

import { useState } from "react";
import type { FAQCategory } from "@/lib/faq-data";

interface FAQCategorizedProps {
  categories: FAQCategory[];
}

export function FAQCategorized({ categories }: FAQCategorizedProps) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const active = categories.find((c) => c.id === activeId) ?? categories[0];

  return (
    <div>
      {/* Category tabs */}
      <div className="mb-10 flex flex-wrap justify-center gap-2 sm:gap-3">
        {categories.map((cat) => {
          const isActive = cat.id === active?.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveId(cat.id);
                setOpenKey(null);
              }}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20 ring-1 ring-accent/40"
                  : "border border-border bg-white text-muted hover:border-accent/40 hover:text-primary"
              }`}
            >
              {cat.title}
              <span
                className={`ml-2 text-xs ${
                  isActive ? "text-accent" : "text-muted-light"
                }`}
              >
                {cat.items.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Questions */}
      <div className="divide-y divide-border border-y border-border">
        {active?.items.map((item, index) => {
          const key = `${active.id}-${index}`;
          return (
            <FAQRow
              key={key}
              question={item.question}
              answer={item.answer}
              isOpen={openKey === key}
              onToggle={() => setOpenKey((prev) => (prev === key ? null : key))}
            />
          );
        })}
      </div>
    </div>
  );
}

function FAQRow({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span
          className={`text-base font-medium transition-colors sm:text-lg ${
            isOpen ? "text-accent" : "text-primary group-hover:text-accent"
          }`}
        >
          {question}
        </span>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1 transition-all duration-300 ${
            isOpen
              ? "rotate-180 bg-accent/15 text-accent ring-accent/40"
              : "bg-surface text-muted ring-border group-hover:ring-accent/40"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 pr-10 text-sm leading-relaxed text-muted sm:text-base">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default FAQCategorized;
