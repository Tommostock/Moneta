"use client";

import { formatRate } from "@/lib/format";
import { formatTime, formatDate } from "@/lib/dates";

interface RateInfoProps {
  base: string;
  quote: string;
  rate: number | null;
  offline: boolean;
  cacheDate?: string;
  fetchedAt?: number;
}

export default function RateInfo({
  base,
  quote,
  rate,
  offline,
  cacheDate,
  fetchedAt,
}: RateInfoProps) {
  if (!rate) {
    return (
      <p className="text-text-muted text-sm font-sans">
        Waiting for rate data — check your connection
      </p>
    );
  }

  const rateStr = formatRate(rate);
  const inverseRate = 1 / rate;
  const inverseRateStr = formatRate(inverseRate);
  // Use the actual fetch time when available, not render time
  const timeStr = fetchedAt ? formatTime(new Date(fetchedAt)) : formatTime(new Date());

  return (
    <div className="flex flex-col gap-1 text-sm font-sans">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-text-secondary">
          1{" "}
          <span className="font-sans tracking-wider">{base}</span>
          {" = "}
          <span className="font-sans tracking-wider">{rateStr}</span>
          {" "}
          <span className="font-sans tracking-wider">{quote}</span>
        </span>
        {offline && cacheDate ? (
          <span className="text-text-muted">
            Offline — rate from {formatDate(cacheDate)}
          </span>
        ) : (
          <span className="text-text-muted">Updated {timeStr}</span>
        )}
      </div>
      <div className="text-text-muted text-xs">
        1{" "}
        <span className="font-sans tracking-wider">{quote}</span>
        {" = "}
        <span className="font-sans tracking-wider">{inverseRateStr}</span>
        {" "}
        <span className="font-sans tracking-wider">{base}</span>
      </div>
    </div>
  );
}
