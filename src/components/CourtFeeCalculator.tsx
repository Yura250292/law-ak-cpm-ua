"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/Card";

const PROZHYTKOVYI_MINIMUM = 3028;

type ClaimType =
  | "property"
  | "non-property"
  | "divorce"
  | "alimony"
  | "appeal"
  | "cassation"
  | "order";

const claimOptions = [
  { value: "property", label: "Майнова вимога" },
  { value: "non-property", label: "Немайнова вимога" },
  { value: "divorce", label: "Розірвання шлюбу" },
  { value: "alimony", label: "Стягнення аліментів" },
  { value: "appeal", label: "Апеляційна скарга" },
  { value: "cassation", label: "Касаційна скарга" },
  { value: "order", label: "Наказне провадження" },
];

function formatUAH(amount: number): string {
  return amount.toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function calculateFee(
  claimType: ClaimType,
  claimAmount: number
): { fee: number; description: string } {
  switch (claimType) {
    case "property": {
      const calculated = claimAmount * 0.015;
      const min = PROZHYTKOVYI_MINIMUM;
      const fee = Math.max(calculated, min);
      return {
        fee,
        description:
          fee === min
            ? `1,5% від ціни позову (мінімум 1 прожитковий мінімум — ${formatUAH(min)} грн)`
            : "1,5% від ціни позову",
      };
    }
    case "non-property":
      return {
        fee: PROZHYTKOVYI_MINIMUM * 0.4,
        description: "0,4 прожиткового мінімуму для працездатних осіб",
      };
    case "divorce":
      return {
        fee: PROZHYTKOVYI_MINIMUM * 0.4,
        description: "0,4 прожиткового мінімуму для працездатних осіб",
      };
    case "alimony":
      return {
        fee: PROZHYTKOVYI_MINIMUM * 0.2,
        description: "0,2 прожиткового мінімуму для працездатних осіб",
      };
    case "appeal": {
      const baseFee = calculateBaseFee(claimAmount);
      return {
        fee: baseFee * 1.5,
        description: "150% від ставки судового збору першої інстанції",
      };
    }
    case "cassation": {
      const baseFee = calculateBaseFee(claimAmount);
      return {
        fee: baseFee * 2,
        description: "200% від ставки судового збору першої інстанції",
      };
    }
    case "order": {
      const baseFee = calculateBaseFee(claimAmount);
      return {
        fee: baseFee * 0.5,
        description: "50% від ставки судового збору",
      };
    }
  }
}

function calculateBaseFee(claimAmount: number): number {
  if (claimAmount > 0) {
    return Math.max(claimAmount * 0.015, PROZHYTKOVYI_MINIMUM);
  }
  return PROZHYTKOVYI_MINIMUM * 0.4;
}

export default function CourtFeeCalculator() {
  const [claimType, setClaimType] = useState<ClaimType>("property");
  const [claimAmount, setClaimAmount] = useState("");
  const [result, setResult] = useState<{
    fee: number;
    description: string;
  } | null>(null);
  const [error, setError] = useState("");

  const needsAmount =
    claimType === "property" ||
    claimType === "appeal" ||
    claimType === "cassation" ||
    claimType === "order";

  function handleCalculate() {
    setError("");
    setResult(null);

    const amount = parseFloat(claimAmount.replace(/\s/g, "").replace(",", "."));

    if (needsAmount && (!amount || amount <= 0)) {
      setError("Введіть суму позову");
      return;
    }

    const { fee, description } = calculateFee(
      claimType,
      needsAmount ? amount : 0
    );

    setResult({ fee, description });
  }

  return (
    <div className="space-y-12">
      {/* Calculator */}
      <Card className="mx-auto max-w-2xl hover:translate-y-0 hover:shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Розрахувати судовий збір</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pb-7">
          <Select
            label="Тип вимоги"
            options={claimOptions}
            value={claimType}
            onChange={(e) => {
              setClaimType(e.target.value as ClaimType);
              setResult(null);
              setError("");
            }}
          />

          {needsAmount && (
            <Input
              label="Сума позову (грн)"
              type="text"
              inputMode="decimal"
              placeholder="Наприклад: 50000"
              value={claimAmount}
              error={error}
              onChange={(e) => {
                setClaimAmount(e.target.value);
                setError("");
              }}
            />
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleCalculate}
          >
            Розрахувати
          </Button>

          {result && (
            <div className="rounded-xl border border-accent bg-accent/5 p-6 space-y-3">
              <p className="text-sm font-medium text-muted">Судовий збір:</p>
              <p className="text-3xl font-bold text-primary">
                {formatUAH(result.fee)} грн
              </p>
              <p className="text-sm text-muted">{result.description}</p>
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted leading-relaxed">
                  Розраховано відповідно до ЗУ &laquo;Про судовий збір&raquo;.
                  Прожитковий мінімум для працездатних осіб у 2026 році &mdash;{" "}
                  {formatUAH(PROZHYTKOVYI_MINIMUM)} грн.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-xl bg-surface p-5">
            <p className="text-sm text-muted leading-relaxed">
              <span className="font-semibold text-primary">Зверніть увагу:</span>{" "}
              Деякі категорії осіб звільнені від сплати судового збору. Точний
              розмір збору може залежати від конкретних обставин справи.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      <div className="mx-auto max-w-4xl grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:translate-y-0">
          <CardHeader>
            <CardTitle className="text-base">
              Хто звільнений від сплати
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted leading-relaxed">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                Позивачі у справах про стягнення заробітної плати
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                Позивачі у справах про відшкодування шкоди, завданої каліцтвом
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                Інваліди I та II груп, діти-інваліди та законні представники
                дітей-інвалідів
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                Позивачі у справах про стягнення аліментів
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                Ветерани війни та члени сімей загиблих
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:translate-y-0">
          <CardHeader>
            <CardTitle className="text-base">Як сплатити судовий збір</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted leading-relaxed">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                Через систему &laquo;Судова влада&raquo; онлайн
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                У будь-якому банку за реквізитами суду
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                Через інтернет-банкінг або мобільний додаток
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                Квитанцію про сплату додайте до позовної заяви
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:translate-y-0 sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Потрібна позовна заява?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted leading-relaxed">
              Замовте підготовку позовної заяви або іншого процесуального
              документа у професійного адвоката.
            </p>
            <Link href="/services">
              <Button variant="primary" size="md" className="w-full">
                Замовити позовну заяву
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
