import type { TimeSeriesPoint } from "@/types";

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function findHighLow(data: TimeSeriesPoint[]): {
  high: TimeSeriesPoint;
  low: TimeSeriesPoint;
} {
  let high = data[0];
  let low = data[0];
  for (const point of data) {
    if (point.rate > high.rate) high = point;
    if (point.rate < low.rate) low = point;
  }
  return { high, low };
}

export function rateContextText(
  base: string,
  quote: string,
  current: number,
  previous: number,
  daysAgo: number
): string {
  const change = percentChange(current, previous);
  const absChange = Math.abs(change).toFixed(1);
  const direction = change >= 0 ? "stronger" : "weaker";
  return `${base} is ${absChange}% ${direction} against ${quote} than ${daysAgo} days ago`;
}
