"use client";

export type Period = "7D" | "30D" | "90D" | "6M" | "1Y";

interface TimePeriodPillsProps {
  selected: Period;
  onSelect: (period: Period) => void;
}

const periods: Period[] = ["7D", "30D", "90D", "6M", "1Y"];

export function periodToDays(period: Period): number {
  switch (period) {
    case "7D": return 7;
    case "30D": return 30;
    case "90D": return 90;
    case "6M": return 182;
    case "1Y": return 365;
  }
}

export function periodToGroup(period: Period): "week" | "month" | undefined {
  switch (period) {
    case "6M": return "week";
    case "1Y": return "week";
    default: return undefined;
  }
}

export default function TimePeriodPills({
  selected,
  onSelect,
}: TimePeriodPillsProps) {
  return (
    <div className="flex gap-2">
      {periods.map((p) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          className={`h-9 px-4 rounded-[4px] font-sans text-sm transition-colors duration-100 ${
            selected === p
              ? "bg-accent text-bg-primary"
              : "bg-bg-raised text-text-secondary border border-border-subtle active:bg-bg-surface"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
