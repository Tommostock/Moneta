"use client";

import { CURRENCY_SYMBOLS } from "@/lib/constants/currencies";
import { ArrowLeftRight } from "lucide-react";

interface ConversionTablePageProps {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  multiplier: number;
  reversed?: boolean;
  onToggleReverse?: () => void;
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
  reversed = false,
  onToggleReverse,
  onRowTap,
}: ConversionTablePageProps) {
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

  const fontSize = multiplier >= 10000 ? "text-[10px]" : multiplier >= 100 ? "text-[12px]" : "text-[13px]";

  return (
    <div className="rounded-[4px] overflow-hidden border border-border-subtle">
      {/* Header */}
      <div className="flex shrink-0">
        <div className="flex-1 bg-bg-surface py-1 flex items-center justify-center">
          <span className="font-sans text-[10px] tracking-wider text-negative font-medium">
            {leftCurrency}
          </span>
        </div>
        <button
          onClick={onToggleReverse}
          className="flex items-center bg-border-subtle px-1 haptic-tap active:bg-accent/20 transition-colors"
          aria-label="Reverse table direction"
        >
          <ArrowLeftRight size={9} className="text-text-muted" />
        </button>
        <div className="flex-1 bg-bg-raised py-1 flex items-center justify-center">
          <span className="font-sans text-[10px] tracking-wider text-accent font-medium">
            {rightCurrency}
          </span>
        </div>
      </div>

      {/* Rows */}
      {rows.map(({ leftAmount, rightAmount }, i) => {
        const evenTint = i % 2 === 1 ? "opacity-[0.97]" : "";
        return (
        <button
          key={i}
          onClick={() => onRowTap?.(i)}
          className="flex border-t border-border-subtle haptic-tap active:bg-accent/5 transition-colors"
        >
          <div className={`flex-1 bg-bg-surface flex items-center justify-center py-[5px] ${evenTint}`}>
            <span className={`font-sans text-text-primary ${fontSize} tabular-nums leading-none`}>
              {leftSymbol}{formatCompact(leftAmount)}
            </span>
          </div>
          <div className="w-px bg-border-subtle" />
          <div className={`flex-1 bg-bg-raised flex items-center justify-center py-[5px] ${evenTint}`}>
            <span className={`font-sans text-text-primary ${fontSize} tabular-nums leading-none`}>
              {rightSymbol}{formatCompact(rightAmount)}
            </span>
          </div>
        </button>
        );
      })}
    </div>
  );
}
