"use client";

import { CURRENCY_SYMBOLS } from "@/lib/constants/currencies";
import { formatAmount } from "@/lib/format";
import { ChevronRight } from "lucide-react";

interface ConversionTablePageProps {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  multiplier: number; // 1, 10, or 100
}

export default function ConversionTablePage({
  baseCurrency,
  quoteCurrency,
  rate,
  multiplier,
}: ConversionTablePageProps) {
  const baseSymbol = CURRENCY_SYMBOLS[baseCurrency] || baseCurrency;
  const quoteSymbol = CURRENCY_SYMBOLS[quoteCurrency] || quoteCurrency;
  const rows = Array.from({ length: 10 }, (_, i) => {
    const baseAmount = (i + 1) * multiplier;
    const convertedAmount = baseAmount * rate;
    return { baseAmount, convertedAmount };
  });

  return (
    <div className="rounded-[4px] overflow-hidden border border-border-subtle">
      {/* Header */}
      <div className="flex">
        <div className="flex-1 bg-bg-surface py-2.5 flex items-center justify-center gap-1.5">
          <span className="font-mono text-sm tracking-wider text-negative font-medium">
            {baseCurrency}
          </span>
        </div>
        <div className="flex items-center bg-border-subtle px-0.5">
          <ChevronRight size={12} className="text-text-muted" />
        </div>
        <div className="flex-1 bg-bg-raised py-2.5 flex items-center justify-center gap-1.5">
          <span className="font-mono text-sm tracking-wider text-accent font-medium">
            {quoteCurrency}
          </span>
        </div>
      </div>

      {/* Rows */}
      {rows.map(({ baseAmount, convertedAmount }, i) => (
        <div key={i} className="flex border-t border-border-subtle">
          <div className="flex-1 bg-bg-surface py-3 flex items-center justify-center">
            <span className="font-mono text-text-primary text-lg">
              {baseSymbol}{formatAmount(baseAmount)}
            </span>
          </div>
          <div className="w-px bg-border-subtle" />
          <div className="flex-1 bg-bg-raised py-3 flex items-center justify-center">
            <span className="font-mono text-text-primary text-lg">
              {quoteSymbol}{formatAmount(convertedAmount)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
