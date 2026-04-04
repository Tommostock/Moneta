"use client";

import { useRef, useState, useCallback } from "react";
import { CURRENCY_SYMBOLS } from "@/lib/constants/currencies";
import { X } from "lucide-react";
import CountryFlag from "@/components/shared/CountryFlag";

interface ExpandedRowSheetProps {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  multiplier: number;
  rowIndex: number;
  reversed: boolean;
  onClose: () => void;
}

function formatValue(value: number): string {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ExpandedRowSheet({
  baseCurrency,
  quoteCurrency,
  rate,
  multiplier,
  rowIndex,
  reversed,
  onClose,
}: ExpandedRowSheetProps) {
  const leftCurrency = reversed ? quoteCurrency : baseCurrency;
  const rightCurrency = reversed ? baseCurrency : quoteCurrency;
  const leftSymbol = CURRENCY_SYMBOLS[leftCurrency] || leftCurrency;
  const rightSymbol = CURRENCY_SYMBOLS[rightCurrency] || rightCurrency;
  const effectiveRate = reversed ? (1 / rate) : rate;

  const baseStart = (rowIndex + 1) * multiplier;
  const baseEnd = (rowIndex + 2) * multiplier;
  const step = multiplier / 10;

  const subRows = Array.from({ length: 11 }, (_, i) => {
    const leftAmount = baseStart + i * step;
    const rightAmount = leftAmount * effectiveRate;
    return { leftAmount, rightAmount };
  });

  const rangeText = `${leftSymbol}${formatValue(baseStart)} - ${leftSymbol}${formatValue(baseEnd)}`;

  // Dismiss animation state
  const [closing, setClosing] = useState(false);

  const handleDismiss = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 250);
  }, [onClose]);

  // Pull-down to close
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const dragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    dragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setDragY(dy);
  };

  const handleTouchEnd = () => {
    dragging.current = false;
    if (dragY > 80) {
      handleDismiss();
    }
    setDragY(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={handleDismiss}
    >
      <div className={`absolute inset-0 bg-black/50 ${closing ? "animate-overlay-out" : "animate-overlay"}`} />

      <div
        className={`relative bg-bg-primary/90 backdrop-blur-xl rounded-t-[12px] max-h-[85dvh] flex flex-col ${
          closing ? "animate-slide-down" : "animate-slide-up"
        }`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 8px)",
          transform: dragY > 0 && !closing ? `translateY(${dragY}px)` : undefined,
          transition: dragY === 0 && !closing ? "transform 200ms ease-out" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-8 h-1 rounded-full bg-border-subtle" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CountryFlag currencyCode={leftCurrency} />
              <span className="font-sans text-text-primary text-sm font-medium tracking-wider">
                {leftCurrency}
              </span>
              <span className="text-text-muted font-sans text-sm">to</span>
              <CountryFlag currencyCode={rightCurrency} />
              <span className="font-sans text-text-primary text-sm font-medium tracking-wider">
                {rightCurrency}
              </span>
            </div>
            <p className="text-text-muted font-sans text-xs">{rangeText}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 active:opacity-70 haptic-tap"
            aria-label="Close"
          >
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="rounded-[4px] overflow-hidden border border-border-subtle">
            <div className="flex bg-bg-surface">
              <div className="flex-1 py-1.5 flex items-center justify-center">
                <span className="font-sans text-[10px] tracking-widest text-text-muted uppercase">{leftCurrency}</span>
              </div>
              <div className="w-px bg-border-subtle" />
              <div className="flex-1 py-1.5 flex items-center justify-center">
                <span className="font-sans text-[10px] tracking-widest text-text-muted uppercase">{rightCurrency}</span>
              </div>
            </div>

            {subRows.map(({ leftAmount, rightAmount }, i) => {
              const isFirst = i === 0;
              const isLast = i === subRows.length - 1;
              const highlight = isFirst || isLast;
              return (
                <div
                  key={i}
                  className={`flex border-t border-border-subtle ${
                    highlight ? "bg-accent/5" : i % 2 === 0 ? "bg-bg-primary" : "bg-bg-raised"
                  }`}
                >
                  <div className="flex-1 py-2.5 flex items-center justify-center">
                    <span className={`font-sans tabular-nums text-sm ${highlight ? "text-accent font-medium" : "text-text-primary"}`}>
                      {leftSymbol}{formatValue(leftAmount)}
                    </span>
                  </div>
                  <div className="w-px bg-border-subtle" />
                  <div className="flex-1 py-2.5 flex items-center justify-center">
                    <span className={`font-sans tabular-nums text-sm ${highlight ? "text-accent font-medium" : "text-text-primary"}`}>
                      {rightSymbol}{formatValue(rightAmount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
