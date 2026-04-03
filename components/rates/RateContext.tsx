"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import type { TimeSeriesPoint } from "@/types";
import { percentChange, findHighLow } from "@/lib/rates";
import { formatRate } from "@/lib/format";
import { formatDate } from "@/lib/dates";

interface RateContextProps {
  base: string;
  quote: string;
  data: TimeSeriesPoint[];
  daysLabel: string;
}

export default function RateContext({
  base,
  quote,
  data,
  daysLabel,
}: RateContextProps) {
  if (data.length < 2) return null;

  const current = data[data.length - 1];
  const previous = data[0];
  const change = percentChange(current.rate, previous.rate);
  const absChange = Math.abs(change).toFixed(1);
  const isPositive = change >= 0;
  const { high, low } = findHighLow(data);

  return (
    <div className="space-y-3">
      {/* Context line */}
      <div className="flex items-center gap-2 text-sm font-sans">
        {isPositive ? (
          <TrendingUp size={16} className="text-positive flex-shrink-0" />
        ) : (
          <TrendingDown size={16} className="text-negative flex-shrink-0" />
        )}
        <span className={isPositive ? "text-positive" : "text-negative"}>
          {base} is {absChange}% {isPositive ? "stronger" : "weaker"} against{" "}
          {quote} than {daysLabel} ago
        </span>
      </div>

      {/* High / Low */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-text-muted font-sans">High</span>
          <span className="text-positive font-sans">
            {formatRate(high.rate)}
          </span>
          <span className="text-text-muted font-sans text-xs">
            {formatDate(high.date)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-muted font-sans">Low</span>
          <span className="text-negative font-sans">
            {formatRate(low.rate)}
          </span>
          <span className="text-text-muted font-sans text-xs">
            {formatDate(low.date)}
          </span>
        </div>
      </div>
    </div>
  );
}
