"use client";

import { useRef, useState, useCallback } from "react";
import ConversionTablePage from "./ConversionTablePage";
import { CURRENCY_SYMBOLS } from "@/lib/constants/currencies";
import { ChevronLeft } from "lucide-react";

interface ConversionTableProps {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number | null;
  onRequestWallpaper?: (multiplier: number) => void;
}

const MULTIPLIERS = [1, 10, 100, 1000, 10000, 100000, 1000000];
const MULTIPLIER_LABELS = ["x1", "x10", "x100", "x1K", "x10K", "x100K", "x1M"];

function formatCompact(value: number): string {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ConversionTable({
  baseCurrency,
  quoteCurrency,
  rate,
  onRequestWallpaper,
}: ConversionTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const [reversed, setReversed] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const w = container.offsetWidth;
    if (w === 0) return;
    const page = Math.round(container.scrollLeft / w);
    setActivePage(Math.max(0, Math.min(page, MULTIPLIERS.length - 1)));
  }, []);

  const handleDotClick = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({
      left: index * container.offsetWidth,
      behavior: "smooth",
    });
  }, []);

  const handleRowTap = useCallback((rowIndex: number) => {
    setExpandedRow(expandedRow === rowIndex ? null : rowIndex);
  }, [expandedRow]);

  if (rate === null) {
    return (
      <div className="h-full rounded-[4px] border border-border-subtle bg-bg-surface flex items-center justify-center">
        <span className="text-text-muted font-sans text-sm">
          Waiting for rate data
        </span>
      </div>
    );
  }

  const leftCurrency = reversed ? quoteCurrency : baseCurrency;
  const rightCurrency = reversed ? baseCurrency : quoteCurrency;
  const leftSymbol = CURRENCY_SYMBOLS[leftCurrency] || leftCurrency;
  const rightSymbol = CURRENCY_SYMBOLS[rightCurrency] || rightCurrency;
  const effectiveRate = reversed ? (1 / rate) : rate;
  const currentMultiplier = MULTIPLIERS[activePage];

  // Expanded sub-rows
  const subRows = expandedRow !== null ? (() => {
    const baseStart = (expandedRow + 1) * currentMultiplier;
    const step = currentMultiplier / 10;
    return Array.from({ length: 11 }, (_, i) => {
      const leftAmount = baseStart + i * step;
      const rightAmount = leftAmount * effectiveRate;
      return { leftAmount, rightAmount };
    });
  })() : null;

  const subFontSize = currentMultiplier >= 1000 ? "text-[11px]" : "text-[13px]";

  return (
    <div className="h-full flex flex-col relative">
      {/* Normal view: scroll + dots + button */}
      <div
        ref={scrollRef}
        className={`flex-1 min-h-0 flex overflow-x-auto snap-x snap-mandatory no-scrollbar ${expandedRow !== null ? "invisible" : ""}`}
        onScroll={handleScroll}
      >
        {MULTIPLIERS.map((mult) => (
          <div key={mult} className="min-w-full h-full snap-start shrink-0">
            <ConversionTablePage
              baseCurrency={baseCurrency}
              quoteCurrency={quoteCurrency}
              rate={rate}
              multiplier={mult}
              reversed={reversed}
              onToggleReverse={() => setReversed(!reversed)}
              onRowTap={handleRowTap}
            />
          </div>
        ))}
      </div>

      {/* Expanded detail view — overlays the scroll area */}
      {expandedRow !== null && subRows && (
        <div className="absolute inset-0 bottom-auto flex flex-col" style={{ height: "calc(100% - 60px)" }}>
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
        </div>
      )}

      {/* Dots with sliding indicator + multiplier label */}
      <div className="flex items-center justify-center gap-1.5 py-1 shrink-0">
        <div className="relative flex items-center gap-1.5">
          {/* Sliding active dot */}
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-accent transition-transform duration-200 ease-out"
            style={{ transform: `translateX(${activePage * 12}px)` }}
          />
          {/* Background dots */}
          {MULTIPLIERS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setExpandedRow(null); handleDotClick(i); }}
              className={`w-1.5 h-1.5 rounded-full ${
                i === activePage ? "bg-transparent" : "bg-text-muted"
              }`}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
        <span className="ml-1.5 text-text-muted font-sans text-[10px]">
          {MULTIPLIER_LABELS[activePage]}
        </span>
      </div>

      {/* Create Wallpaper button */}
      {onRequestWallpaper && (
        <button
          onClick={() => onRequestWallpaper(MULTIPLIERS[activePage])}
          className="w-full h-8 rounded-[4px] border border-border-subtle text-text-secondary font-sans text-xs tracking-wider active:bg-bg-raised haptic-tap transition-colors shrink-0"
        >
          Create Wallpaper
        </button>
      )}
    </div>
  );
}
