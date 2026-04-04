"use client";

import { useRef, useState, useCallback } from "react";
import { X } from "lucide-react";
import { CURRENCY_SYMBOLS } from "@/lib/constants/currencies";

interface TipCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency: string;
  homeCurrency: string;
  rate: number;
}

const TIP_PERCENTAGES = [10, 15, 20, 25];

function formatVal(value: number): string {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function TipCalculator({
  isOpen,
  onClose,
  amount,
  currency,
  homeCurrency,
  rate,
}: TipCalculatorProps) {
  const [closing, setClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const isDragging = useRef(false);

  const handleDismiss = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 250);
  }, [onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setDragY(dy);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    if (dragY > 80) {
      handleDismiss();
    }
    setDragY(0);
  };

  if (!isOpen || amount <= 0) return null;

  const quoteSymbol = CURRENCY_SYMBOLS[currency] || currency;
  const homeSymbol = CURRENCY_SYMBOLS[homeCurrency] || homeCurrency;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={handleDismiss}
    >
      <div className={`absolute inset-0 bg-black/50 ${closing ? "animate-overlay-out" : "animate-overlay"}`} />
      <div
        className={`relative bg-bg-primary/90 backdrop-blur-xl rounded-t-[12px] ${
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
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-8 h-1 rounded-full bg-border-subtle" />
        </div>

        <div className="px-4 pb-2 flex items-center justify-between">
          <p className="font-sans text-text-primary text-sm font-medium">
            Tip on {quoteSymbol}{formatVal(amount)}
          </p>
          <button
            onClick={handleDismiss}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 active:opacity-70 haptic-tap"
            aria-label="Close"
          >
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="rounded-[4px] overflow-hidden border border-border-subtle">
            <div className="flex bg-bg-surface">
              <div className="w-16 py-2 flex items-center justify-center">
                <span className="font-sans text-[10px] tracking-widest text-text-muted uppercase">Tip</span>
              </div>
              <div className="w-px bg-border-subtle" />
              <div className="flex-1 py-2 flex items-center justify-center">
                <span className="font-sans text-[10px] tracking-widest text-text-muted uppercase">{currency}</span>
              </div>
              <div className="w-px bg-border-subtle" />
              <div className="flex-1 py-2 flex items-center justify-center">
                <span className="font-sans text-[10px] tracking-widest text-text-muted uppercase">Total {currency}</span>
              </div>
            </div>

            {TIP_PERCENTAGES.map((pct, i) => {
              const tipAmount = amount * (pct / 100);
              const total = amount + tipAmount;
              return (
                <div key={pct} className={`flex border-t border-border-subtle ${i % 2 === 0 ? "bg-bg-surface" : "bg-bg-raised"}`}>
                  <div className="w-16 py-2.5 flex items-center justify-center">
                    <span className="font-sans text-accent text-sm font-medium">{pct}%</span>
                  </div>
                  <div className="w-px bg-border-subtle" />
                  <div className="flex-1 py-2.5 flex items-center justify-center">
                    <span className="font-sans text-text-primary text-sm tabular-nums">
                      {quoteSymbol}{formatVal(tipAmount)}
                    </span>
                  </div>
                  <div className="w-px bg-border-subtle" />
                  <div className="flex-1 py-2.5 flex items-center justify-center">
                    <span className="font-sans text-text-primary text-sm tabular-nums font-medium">
                      {quoteSymbol}{formatVal(total)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-text-secondary text-[11px] font-sans mt-2 text-center">
            Total at 20% = ~{homeSymbol}{formatVal(amount * 1.2 * rate)} in {homeCurrency}
          </p>
        </div>
      </div>
    </div>
  );
}
