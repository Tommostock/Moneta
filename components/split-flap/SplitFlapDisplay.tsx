"use client";

import SplitFlapGroup from "./SplitFlapGroup";
import { formatAmount } from "@/lib/format";

interface SplitFlapDisplayProps {
  currencyCode: string;
  amount: number | null;
  size?: "sm" | "md" | "lg";
}

export default function SplitFlapDisplay({
  currencyCode,
  amount,
  size = "lg",
}: SplitFlapDisplayProps) {
  const displayValue =
    amount !== null ? formatAmount(amount) : "----.--";

  // Pad to consistent width for visual stability
  const padded = displayValue.padStart(12, " ");

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-text-secondary tracking-wider text-sm">
        {currencyCode}
      </span>
      <SplitFlapGroup value={padded} size={size} />
    </div>
  );
}
