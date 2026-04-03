"use client";

import { useState, useCallback } from "react";

interface QuickAmountsProps {
  onSelect: (amount: number) => void;
  activeAmount: number | null;
}

const amounts = [5, 10, 20, 50, 100];

export default function QuickAmounts({
  onSelect,
  activeAmount,
}: QuickAmountsProps) {
  const [flashAmount, setFlashAmount] = useState<number | null>(null);

  const handleTap = useCallback(
    (amount: number) => {
      setFlashAmount(amount);
      onSelect(amount);
      // Clear flash after animation completes
      setTimeout(() => setFlashAmount(null), 200);
    },
    [onSelect]
  );

  return (
    <div className="flex gap-2">
      {amounts.map((amount) => {
        const isActive = activeAmount === amount;
        const isFlashing = flashAmount === amount && !isActive;
        return (
          <button
            key={amount}
            onClick={() => handleTap(amount)}
            className={`flex-1 h-11 rounded-[4px] font-mono text-sm transition-all duration-100 ${
              isActive
                ? "bg-accent text-bg-primary"
                : isFlashing
                  ? "bg-accent/30 text-text-primary border border-accent/50 scale-95"
                  : "bg-bg-raised text-text-secondary border border-border-subtle active:bg-bg-surface active:text-text-primary"
            }`}
            style={{
              transition: isFlashing
                ? "all 150ms ease-out"
                : "all 100ms ease-out",
            }}
          >
            {amount}
          </button>
        );
      })}
    </div>
  );
}
