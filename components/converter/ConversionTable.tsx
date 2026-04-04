"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import ConversionTablePage from "./ConversionTablePage";
import ExpandedRowSheet from "./ExpandedRowSheet";

interface ConversionTableProps {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number | null;
  onRequestWallpaper?: (multiplier: number) => void;
  onRequestTip?: () => void;
  showTipButton?: boolean;
  onFlip?: () => void;
}

const MULTIPLIERS = [1, 10, 100, 1000, 10000, 100000, 1000000];
const MULTIPLIER_LABELS = ["x1", "x10", "x100", "x1K", "x10K", "x100K", "x1M"];

export default function ConversionTable({
  baseCurrency,
  quoteCurrency,
  rate,
  onRequestWallpaper,
  onRequestTip,
  showTipButton,
  onFlip,
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
              onRowTap={(rowIndex) => setExpandedRow(rowIndex)}
            />
          </div>
        ))}
      </div>

      {/* Pill indicator + multiplier label */}
      <div className="flex items-center justify-center gap-1.5 py-1 shrink-0">
        <div className="relative flex items-center gap-1">
          {/* Sliding pill */}
          <div
            className="absolute h-1.5 bg-accent rounded-full transition-all duration-300 ease-out"
            style={{
              width: 10,
              left: activePage * 10,
            }}
          />
          {/* Background dots */}
          {MULTIPLIERS.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className="w-[10px] h-1.5 flex items-center justify-center"
              aria-label={`Page ${i + 1}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full transition-opacity duration-200 ${
                i === activePage ? "opacity-0" : "bg-text-muted opacity-100"
              }`} />
            </button>
          ))}
        </div>
        <span className="ml-1 text-text-muted font-sans text-[10px]">
          {MULTIPLIER_LABELS[activePage]}
        </span>
      </div>

      {/* Action buttons — side by side */}
      <div className="flex gap-2 shrink-0">
        {showTipButton && onRequestTip && (
          <button
            onClick={onRequestTip}
            className="flex-1 h-8 rounded-[4px] border border-border-subtle text-text-secondary font-sans text-xs tracking-wider active:bg-bg-raised haptic-tap transition-colors"
          >
            Tip Calculator
          </button>
        )}
        {onRequestWallpaper && (
          <button
            onClick={() => onRequestWallpaper(MULTIPLIERS[activePage])}
            className="flex-1 h-8 rounded-[4px] border border-border-subtle text-text-secondary font-sans text-xs tracking-wider active:bg-bg-raised haptic-tap transition-colors"
          >
            Create Wallpaper
          </button>
        )}
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
