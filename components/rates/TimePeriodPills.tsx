"use client";

export type Period = "7D" | "30D" | "90D" | "6M" | "1Y" | "5Y" | "10Y";

interface TimePeriodPillsProps {
  selected: Period;
  onSelect: (period: Period) => void;
}

const periods: Period[] = ["7D", "30D", "90D", "6M", "1Y", "5Y", "10Y"];

export function periodToDays(period: Period): number {
  switch (period) {
    case "7D": return 7;
    case "30D": return 30;
    case "90D": return 90;
    case "6M": return 182;
    case "1Y": return 365;
    case "5Y": return 1825;
    case "10Y": return 3650;
  }
}

export function periodToGroup(period: Period): "week" | "month" | undefined {
  switch (period) {
    case "6M": return "week";
    case "1Y": return "week";
    case "5Y": return "month";
    case "10Y": return "month";
    default: return undefined;
  }
}

export default function TimePeriodPills({
  selected,
  onSelect,
}: TimePeriodPillsProps) {
  return (
    <div className="flex rounded-[4px] border border-border-subtle overflow-hidden">
      {periods.map((p, i) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          className={`flex-1 h-9 font-sans text-sm transition-colors duration-200 haptic-tap ${
            selected === p
              ? "bg-accent text-bg-primary font-medium"
              : "bg-bg-surface text-text-muted active:bg-bg-raised"
          } ${i > 0 ? "border-l border-border-subtle" : ""}`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
