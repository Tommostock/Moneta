"use client";

import { useCallback } from "react";
import { CURRENCY_SYMBOLS } from "@/lib/constants/currencies";
import { ArrowLeftRight } from "lucide-react";

interface ConversionTablePageProps {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  multiplier: number;
  onToggleReverse?: () => void;
  flipRotation?: number;
  onRowTap?: (rowIndex: number) => void;
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
  onToggleReverse,
  flipRotation = 0,
  onRowTap,
}: ConversionTablePageProps) {
  const leftSymbol = CURRENCY_SYMBOLS[baseCurrency] || baseCurrency;
  const rightSymbol = CURRENCY_SYMBOLS[quoteCurrency] || quoteCurrency;
  const rows = Array.from({ length: 10 }, (_, i) => {
    const leftAmount = (i + 1) * multiplier;
    const rightAmount = leftAmount * rate;
    return { leftAmount, rightAmount };
  });

  const handleRowClick = useCallback((i: number) => {
    onRowTap?.(i);
  }, [onRowTap]);

  return (
    <div className="rounded-[4px] overflow-hidden border border-border-subtle flex flex-col">
      {/* Header */}
      <div className="relative flex shrink-0">
        <div className="flex-1 bg-bg-surface py-2.5 flex items-center justify-center">
          <span className="font-sans text-sm tracking-wider text-negative font-medium">
            {baseCurrency}
          </span>
        </div>
        <div className="w-px bg-border-subtle" />
        <div className="flex-1 bg-bg-raised py-2.5 flex items-center justify-center">
          <span className="font-sans text-sm tracking-wider text-accent font-medium">
            {quoteCurrency}
          </span>
        </div>
        <button
          onClick={onToggleReverse}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-border-subtle rounded-[4px] haptic-tap active:bg-accent/20 transition-colors"
          aria-label="Reverse table direction"
        >
          <div
            style={{
              transform: `rotate(${flipRotation}deg)`,
              transition: "transform 300ms ease-out",
            }}
          >
            <ArrowLeftRight size={14} className="text-text-muted" />
          </div>
        </button>
      </div>

      {/* Rows */}
      {rows.map(({ leftAmount, rightAmount }, i) => {
        const rowBg = i % 2 === 0 ? "bg-bg-primary" : "bg-bg-raised";
        return (
        <button
          key={i}
          onClick={() => handleRowClick(i)}
          className={`flex w-full border-t border-border-subtle haptic-tap active:bg-accent/5 transition-colors ${rowBg}`}
        >
          <div className="flex-1 flex items-center justify-center py-[11px]">
            <span className="font-sans text-text-primary text-[13px] tabular-nums leading-tight">
              {leftSymbol}{formatCompact(leftAmount)}
            </span>
          </div>
          <div className="w-px bg-border-subtle" />
          <div className="flex-1 flex items-center justify-center py-[11px]">
            <span className="font-sans text-text-primary text-[13px] tabular-nums leading-tight">
              {rightSymbol}{formatCompact(rightAmount)}
            </span>
          </div>
        </button>
        );
      })}
    </div>
  );
}
