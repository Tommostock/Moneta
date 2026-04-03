"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import ConversionTablePage from "./ConversionTablePage";
import { Share2 } from "lucide-react";
import { CURRENCY_SYMBOLS } from "@/lib/constants/currencies";

interface ConversionTableProps {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number | null;
  onRequestWallpaper?: (multiplier: number) => void;
  onRowTap?: (amount: number) => void;
}

const MULTIPLIERS = [1, 10, 100, 1000, 10000, 100000, 1000000];
const MULTIPLIER_LABELS = ["x1", "x10", "x100", "x1K", "x10K", "x100K", "x1M"];

export default function ConversionTable({
  baseCurrency,
  quoteCurrency,
  rate,
  onRequestWallpaper,
  onRowTap,
}: ConversionTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>(new Array(MULTIPLIERS.length).fill(null));
  const [activePage, setActivePage] = useState(0);
  const [reversed, setReversed] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = pageRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index >= 0) setActivePage(index);
          }
        }
      },
      { root: container, threshold: 0.5 }
    );

    for (const ref of pageRefs.current) {
      if (ref) observer.observe(ref);
    }

    return () => observer.disconnect();
  }, []);

  const handleDotClick = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({
      left: index * container.offsetWidth,
      behavior: "smooth",
    });
  };

  const handleShare = useCallback(async () => {
    if (!rate) return;
    const baseSymbol = CURRENCY_SYMBOLS[baseCurrency] || baseCurrency;
    const quoteSymbol = CURRENCY_SYMBOLS[quoteCurrency] || quoteCurrency;
    const text = `${baseSymbol}1 = ${quoteSymbol}${rate.toFixed(2)} (via MONETA)`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch { /* cancelled */ }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
    } catch { /* ignore */ }
  }, [rate, baseCurrency, quoteCurrency]);

  if (rate === null) {
    return (
      <div className="rounded-[4px] border border-border-subtle bg-bg-surface h-[360px] flex items-center justify-center">
        <span className="text-text-muted font-sans text-sm">
          Waiting for rate data
        </span>
      </div>
    );
  }

  return (
    <div>
      {/* Swipeable pages */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
      >
        {MULTIPLIERS.map((mult, i) => (
          <div
            key={mult}
            ref={(el) => { pageRefs.current[i] = el; }}
            className="min-w-full snap-start shrink-0"
          >
            <ConversionTablePage
              baseCurrency={baseCurrency}
              quoteCurrency={quoteCurrency}
              rate={rate}
              multiplier={mult}
              reversed={reversed}
              onToggleReverse={() => setReversed(!reversed)}
              onRowTap={onRowTap}
            />
          </div>
        ))}
      </div>

      {/* Dots + multiplier label */}
      <div className="flex items-center justify-center gap-1.5 py-2">
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
        <span className="ml-1.5 text-text-muted font-mono text-[10px]">
          {MULTIPLIER_LABELS[activePage]}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {onRequestWallpaper && (
          <button
            onClick={() => onRequestWallpaper(MULTIPLIERS[activePage])}
            className="flex-1 h-10 rounded-[4px] border border-border-subtle text-text-secondary font-sans text-xs tracking-wider active:bg-bg-raised haptic-tap transition-colors"
          >
            Create Wallpaper
          </button>
        )}
        <button
          onClick={handleShare}
          className="h-10 px-4 rounded-[4px] border border-border-subtle text-text-secondary active:bg-bg-raised haptic-tap transition-colors flex items-center justify-center"
          aria-label="Share rate"
        >
          <Share2 size={14} />
        </button>
      </div>
    </div>
  );
}
