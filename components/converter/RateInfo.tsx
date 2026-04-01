"use client";

import { formatRate } from "@/lib/format";
import { formatTime, formatDate } from "@/lib/dates";

interface RateInfoProps {
  base: string;
  quote: string;
  rate: number | null;
  offline: boolean;
  cacheDate?: string;
}

export default function RateInfo({
  base,
  quote,
  rate,
  offline,
  cacheDate,
}: RateInfoProps) {
  if (!rate) {
    return (
      <p className="text-text-muted text-sm font-sans">
        Waiting for rate data
      </p>
    );
  }

  const rateStr = formatRate(rate);
  const timeStr = formatTime(new Date());

  return (
    <div className="text-sm font-sans">
      <span className="text-text-secondary">
        1{" "}
        <span className="font-mono tracking-wider">{base}</span>
        {" = "}
        <span className="font-mono tracking-wider">{rateStr}</span>
        {" "}
        <span className="font-mono tracking-wider">{quote}</span>
      </span>
      {offline && cacheDate ? (
        <span className="text-text-muted ml-2">
          Offline — rate from {formatDate(cacheDate)}
        </span>
      ) : (
        <span className="text-text-muted ml-2">Updated {timeStr}</span>
      )}
    </div>
  );
}
