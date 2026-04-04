"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import ConversionTablePage from "./ConversionTablePage";
import ExpandedRowSheet from "./ExpandedRowSheet";

interface ConversionTableProps {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number | null;
  onFlip?: () => void;
  flipRotation?: number;
}

const MULTIPLIERS = [1, 10, 100, 1000, 10000, 100000, 1000000];
const MULTIPLIER_LABELS = ["x1", "x10", "x100", "x1K", "x10K", "x100K", "x1M"];

export default function ConversionTable({
  baseCurrency,
  quoteCurrency,
  rate,
  onFlip,
  flipRotation = 0,
}: ConversionTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activePage, setActivePage] = useState(0);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const calcPage = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const w = container.offsetWidth;
    if (w === 0) return;
    const page = Math.round(container.scrollLeft / w);
    setActivePage(Math.max(0, Math.min(page, MULTIPLIERS.length - 1)));
  }, []);

  // Debounced scroll handler — waits 80ms after last scroll event
  const handleScroll = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(calcPage, 80);
  }, [calcPage]);

  // Also use scrollend for browsers that support it (more reliable after snap)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onScrollEnd = () => calcPage();
    container.addEventListener("scrollend", onScrollEnd);
    return () => container.removeEventListener("scrollend", onScrollEnd);
  }, [calcPage]);

  const handleDotClick = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({
      left: index * container.offsetWidth,
      behavior: "smooth",
    });
  }, []);

  if (rate === null) {
    return (
      <div className="h-full rounded-[4px] border border-border-subtle bg-bg-surface flex items-center justify-center">
        <span className="text-text-muted font-sans text-sm">
          Waiting for rate data
        </span>
      </div>
    );
  }

  const currentMultiplier = MULTIPLIERS[activePage];

  return (
    <div className="flex flex-col">
      {/* Swipeable pages */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        onScroll={handleScroll}
      >
        {MULTIPLIERS.map((mult) => (
          <div key={mult} className="min-w-full snap-start shrink-0">
            <ConversionTablePage
              baseCurrency={baseCurrency}
              quoteCurrency={quoteCurrency}
              rate={rate}
              multiplier={mult}
              onToggleReverse={onFlip}
              flipRotation={flipRotation}
              onRowTap={(rowIndex) => setExpandedRow(rowIndex)}
            />
          </div>
        ))}
      </div>

      {/* Multiplier tabs */}
      <div className="pt-2 shrink-0">
        <div className="flex rounded-[4px] border border-border-subtle overflow-hidden">
          {MULTIPLIER_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`flex-1 py-1.5 font-sans text-xs tracking-wide transition-colors duration-200 haptic-tap ${
                i === activePage
                  ? "bg-accent text-bg-primary font-medium"
                  : "bg-bg-surface text-text-muted active:bg-bg-raised"
              } ${i > 0 ? "border-l border-border-subtle" : ""}`}
              aria-label={`Show ${label} multiplier`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded row bottom sheet */}
      {expandedRow !== null && (
        <ExpandedRowSheet
          baseCurrency={baseCurrency}
          quoteCurrency={quoteCurrency}
          rate={rate}
          multiplier={currentMultiplier}
          rowIndex={expandedRow}
          reversed={false}
          onClose={() => setExpandedRow(null)}
        />
      )}
    </div>
  );
}
