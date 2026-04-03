"use client";

import { useRef, useState, useCallback } from "react";
import ConversionTablePage from "./ConversionTablePage";

interface ConversionTableProps {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number | null;
  onRequestWallpaper?: (multiplier: number) => void;
}

const MULTIPLIERS = [1, 10, 100, 1000, 10000, 100000, 1000000];
const MULTIPLIER_LABELS = ["x1", "x10", "x100", "x1K", "x10K", "x100K", "x1M"];

export default function ConversionTable({
  baseCurrency,
  quoteCurrency,
  rate,
  onRequestWallpaper,
}: ConversionTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const [reversed, setReversed] = useState(false);

  // Detect which page is active after scrolling stops
  const updateActivePage = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const w = container.offsetWidth;
    if (w === 0) return;
    const page = Math.round(container.scrollLeft / w);
    setActivePage(Math.max(0, Math.min(page, MULTIPLIERS.length - 1)));
  }, []);

  // Use both onScroll and onScrollEnd for maximum compatibility
  const handleScroll = useCallback(() => {
    updateActivePage();
  }, [updateActivePage]);

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

  return (
    <div className="h-full flex flex-col">
      {/* Swipeable pages — takes all available height */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        onScroll={handleScroll}
      >
        {MULTIPLIERS.map((mult) => (
          <div
            key={mult}
            className="min-w-full h-full snap-start shrink-0"
          >
            <ConversionTablePage
              baseCurrency={baseCurrency}
              quoteCurrency={quoteCurrency}
              rate={rate}
              multiplier={mult}
              reversed={reversed}
              onToggleReverse={() => setReversed(!reversed)}
            />
          </div>
        ))}
      </div>

      {/* Dots + multiplier label */}
      <div className="flex items-center justify-center gap-1.5 py-1 shrink-0">
        {MULTIPLIERS.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
              i === activePage ? "bg-accent" : "bg-text-muted"
            }`}
            aria-label={`Page ${i + 1}`}
          />
        ))}
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
