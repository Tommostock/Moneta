"use client";

interface QuickAmountsProps {
  onSelect: (amount: number) => void;
  activeAmount: number | null;
}

const amounts = [5, 10, 20, 50, 100];

export default function QuickAmounts({
  onSelect,
  activeAmount,
}: QuickAmountsProps) {
  return (
    <div className="flex gap-2">
      {amounts.map((amount) => (
        <button
          key={amount}
          onClick={() => onSelect(amount)}
          className={`flex-1 h-11 rounded-[4px] font-mono text-sm transition-colors duration-100 ${
            activeAmount === amount
              ? "bg-accent text-bg-primary"
              : "bg-bg-raised text-text-secondary border border-border-subtle active:bg-bg-surface active:text-text-primary"
          }`}
        >
          {amount}
        </button>
      ))}
    </div>
  );
}
