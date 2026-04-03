"use client";

import { CURRENCY_SYMBOLS } from "@/lib/constants/currencies";
import { ChevronRight } from "lucide-react";
import SegmentDisplay from "@/components/display/SegmentDisplay";

interface ConversionTablePageProps {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  multiplier: number;
}

function formatCompact(value: number): string {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

  // Scale segment size for large numbers
  const segSize = multiplier >= 10000 ? 12 : multiplier >= 100 ? 14 : 16;

  return (
    <div className="rounded-[4px] overflow-hidden border border-border-subtle">
      {/* Header */}
      <div className="flex">
        <div className="flex-1 bg-bg-surface py-1.5 flex items-center justify-center">
          <span className="font-mono text-xs tracking-wider text-negative font-medium">
            {baseCurrency}
          </span>
        </div>
        <div className="flex items-center bg-border-subtle px-0.5">
          <ChevronRight size={10} className="text-text-muted" />
        </div>
        <div className="flex-1 bg-bg-raised py-1.5 flex items-center justify-center">
          <span className="font-mono text-xs tracking-wider text-accent font-medium">
            {quoteCurrency}
          </span>
        </div>
      </div>

      {/* Rows */}
      {rows.map(({ baseAmount, convertedAmount }, i) => (
        <div key={i} className="flex border-t border-border-subtle">
          <div className="flex-1 bg-bg-surface py-1.5 flex items-center justify-center">
            <span className="text-text-secondary mr-0.5" style={{ fontSize: segSize * 0.75, fontFamily: "var(--font-inter)" }}>
              {baseSymbol}
            </span>
            <SegmentDisplay value={formatCompact(baseAmount)} size={segSize} />
          </div>
          <div className="w-px bg-border-subtle" />
          <div className="flex-1 bg-bg-raised py-1.5 flex items-center justify-center">
            <span className="text-text-secondary mr-0.5" style={{ fontSize: segSize * 0.75, fontFamily: "var(--font-inter)" }}>
              {quoteSymbol}
            </span>
            <SegmentDisplay value={formatCompact(convertedAmount)} size={segSize} />
          </div>
        </div>
      ))}
    </div>
  );
}
