"use client";

import { useEffect, useState, useId } from "react";
import { fetchTimeSeries } from "@/lib/api/frankfurter";
import { daysAgoDate, todayDate } from "@/lib/dates";
import type { TimeSeriesPoint } from "@/types";

interface SparklineProps {
  base: string;
  quote: string;
}

export default function Sparkline({ base, quote }: SparklineProps) {
  const [data, setData] = useState<TimeSeriesPoint[]>([]);
  const gradientId = useId().replace(/:/g, "");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await fetchTimeSeries(
          base,
          quote,
          daysAgoDate(30),
          todayDate()
        );
        if (!cancelled) setData(result.data);
      } catch {
        // silently fail — sparkline is optional
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [base, quote]);

  if (data.length < 2) {
    return (
      <div className="w-full h-10 flex items-center">
        <div className="w-full h-[2px] bg-bg-raised animate-pulse rounded-full" />
      </div>
    );
  }

  const rates = data.map((d) => d.rate);
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const range = max - min || 1;

  const width = 200;
  const height = 40;
  const padding = 2;

  const points = data
    .map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y =
        height - padding - ((d.rate - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const firstX = padding;
  const lastX = padding + (width - padding * 2);
  const fillPoints = `${firstX},${height} ${points} ${lastX},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-10"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4A843" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#D4A843" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke="#D4A843"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
