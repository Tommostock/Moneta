"use client";

import { CURRENCY_SYMBOLS } from "@/lib/constants/currencies";
import { ArrowLeftRight } from "lucide-react";
import SegmentDisplay from "@/components/display/SegmentDisplay";

interface ConversionTablePageProps {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  multiplier: number;
  reversed?: boolean;
  onToggleReverse?: () => void;
  onRowTap?: (amount: number) => void;
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
  // When reversed, swap which side shows base vs quote
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

  const segSize = multiplier >= 10000 ? 12 : multiplier >= 100 ? 14 : 16;

  return (
    <div className="rounded-[4px] overflow-hidden border border-border-subtle">
      {/* Header with reverse toggle */}
      <div className="flex">
        <div className="flex-1 bg-bg-surface py-1.5 flex items-center justify-center">
          <span className="font-mono text-xs tracking-wider text-negative font-medium">
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
          <span className="font-mono text-xs tracking-wider text-accent font-medium">
            {rightCurrency}
          </span>
        </div>
      </div>

      {/* Rows */}
      {rows.map(({ leftAmount, rightAmount }, i) => (
        <button
          key={i}
          onClick={() => onRowTap?.(leftAmount)}
          className="flex w-full border-t border-border-subtle haptic-tap active:bg-accent/5 transition-colors"
        >
          <div className="flex-1 bg-bg-surface py-1.5 flex items-center justify-center">
            <span className="text-text-secondary mr-0.5" style={{ fontSize: segSize * 0.75, fontFamily: "var(--font-inter)" }}>
              {leftSymbol}
            </span>
            <SegmentDisplay value={formatCompact(leftAmount)} size={segSize} />
          </div>
          <div className="w-px bg-border-subtle" />
          <div className="flex-1 bg-bg-raised py-1.5 flex items-center justify-center">
            <span className="text-text-secondary mr-0.5" style={{ fontSize: segSize * 0.75, fontFamily: "var(--font-inter)" }}>
              {rightSymbol}
            </span>
            <SegmentDisplay value={formatCompact(rightAmount)} size={segSize} />
          </div>
        </button>
      ))}
    </div>
  );
}
