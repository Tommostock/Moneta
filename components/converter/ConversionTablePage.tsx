"use client";

import { useState } from "react";
import { CURRENCY_SYMBOLS } from "@/lib/constants/currencies";
import { ArrowLeftRight, ChevronLeft } from "lucide-react";

interface ConversionTablePageProps {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  multiplier: number;
  reversed?: boolean;
  onToggleReverse?: () => void;
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
  reversed = false,
  onToggleReverse,
}: ConversionTablePageProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const leftCurrency = reversed ? quoteCurrency : baseCurrency;
  const rightCurrency = reversed ? baseCurrency : quoteCurrency;
  const leftSymbol = CURRENCY_SYMBOLS[leftCurrency] || leftCurrency;
  const rightSymbol = CURRENCY_SYMBOLS[rightCurrency] || rightCurrency;
  const effectiveRate = reversed ? (1 / rate) : rate;

  const rows = Array.from({ length: 10 }, (_, i) => {
    const leftAmount = (i + 1) * multiplier;
    const rightAmount = leftAmount * effectiveRate;
    return { leftAmount, rightAmount };
  });

  const fontSize = multiplier >= 10000 ? "text-[11px]" : multiplier >= 100 ? "text-[13px]" : "text-[15px]";

  const handleRowTap = (rowIndex: number) => {
    setExpandedRow(expandedRow === rowIndex ? null : rowIndex);
  };

  // When a row is expanded, show sub-increments between that row's value and the next
  if (expandedRow !== null) {
    const baseStart = (expandedRow + 1) * multiplier;
    const step = multiplier / 10;
    const subRows = Array.from({ length: 11 }, (_, i) => {
      const leftAmount = baseStart + i * step;
      const rightAmount = leftAmount * effectiveRate;
      return { leftAmount, rightAmount };
    });

    // Use smaller font for sub-rows since they have more decimal places
    const subFontSize = multiplier >= 1000 ? "text-[11px]" : multiplier >= 10 ? "text-[13px]" : "text-[13px]";

    return (
      <div className="h-full rounded-[4px] overflow-hidden border border-border-subtle flex flex-col">
        {/* Header with back button */}
        <div className="flex shrink-0">
          <button
            onClick={() => setExpandedRow(null)}
            className="flex items-center bg-bg-surface px-2 haptic-tap active:bg-bg-raised transition-colors"
            aria-label="Back to table"
          >
            <ChevronLeft size={14} className="text-text-muted" />
          </button>
          <div className="flex-1 bg-bg-surface py-1.5 flex items-center justify-center">
            <span className="font-sans text-xs tracking-wider text-negative font-medium">
              {leftCurrency}
            </span>
          </div>
          <div className="w-px bg-border-subtle" />
          <div className="flex-1 bg-bg-raised py-1.5 flex items-center justify-center">
            <span className="font-sans text-xs tracking-wider text-accent font-medium">
              {rightCurrency}
            </span>
          </div>
        </div>

        {/* Sub-rows */}
        {subRows.map(({ leftAmount, rightAmount }, i) => (
          <div
            key={i}
            className={`flex border-t border-border-subtle flex-1 ${i === 0 ? "bg-accent/5" : ""}`}
          >
            <div className={`flex-1 ${i === 0 ? "bg-accent/5" : "bg-bg-surface"} flex items-center justify-center`}>
              <span className={`font-sans text-text-primary ${subFontSize} tabular-nums`}>
                {leftSymbol}{formatCompact(leftAmount)}
              </span>
            </div>
            <div className="w-px bg-border-subtle" />
            <div className={`flex-1 ${i === 0 ? "bg-accent/5" : "bg-bg-raised"} flex items-center justify-center`}>
              <span className={`font-sans text-text-primary ${subFontSize} tabular-nums`}>
                {rightSymbol}{formatCompact(rightAmount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full rounded-[4px] overflow-hidden border border-border-subtle flex flex-col">
      {/* Header with reverse toggle */}
      <div className="flex shrink-0">
        <div className="flex-1 bg-bg-surface py-1.5 flex items-center justify-center">
          <span className="font-sans text-xs tracking-wider text-negative font-medium">
            {leftCurrency}
          </span>
        </div>
        <button
          onClick={onToggleReverse}
          className="flex items-center bg-border-subtle px-1.5 haptic-tap active:bg-accent/20 transition-colors"
          aria-label="Reverse table direction"
        >
          <ArrowLeftRight size={10} className="text-text-muted" />
        </button>
        <div className="flex-1 bg-bg-raised py-1.5 flex items-center justify-center">
          <span className="font-sans text-xs tracking-wider text-accent font-medium">
            {rightCurrency}
          </span>
        </div>
      </div>

      {/* Rows */}
      {rows.map(({ leftAmount, rightAmount }, i) => (
        <button
          key={i}
          onClick={() => handleRowTap(i)}
          className="flex border-t border-border-subtle flex-1 haptic-tap active:bg-accent/5 transition-colors"
        >
          <div className="flex-1 bg-bg-surface flex items-center justify-center">
            <span className={`font-sans text-text-primary ${fontSize} tabular-nums`}>
              {leftSymbol}{formatCompact(leftAmount)}
            </span>
          </div>
          <div className="w-px bg-border-subtle" />
          <div className="flex-1 bg-bg-raised flex items-center justify-center">
            <span className={`font-sans text-text-primary ${fontSize} tabular-nums`}>
              {rightSymbol}{formatCompact(rightAmount)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
