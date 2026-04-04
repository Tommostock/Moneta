"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import CountryFlag from "@/components/shared/CountryFlag";
import { fetchLatestRatesBatch, fetchTimeSeriesBatch } from "@/lib/api/frankfurter";
import { ALL_CURRENCY_CODES } from "@/lib/constants/currencies";
import { daysAgoDate, todayDate } from "@/lib/dates";
import { periodToDays, periodToGroup } from "./TimePeriodPills";
import type { Period } from "./TimePeriodPills";

interface LeagueEntry {
  code: string;
  currentRate: number;
  change: number;
}

interface CurrencyLeagueTableProps {
  base: string;
  period: Period;
}

export default function CurrencyLeagueTable({
  base,
  period,
}: CurrencyLeagueTableProps) {
  const [entries, setEntries] = useState<LeagueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      const days = periodToDays(period);
      const group = periodToGroup(period);
      const from = daysAgoDate(days);
      const to = todayDate();
      const quotes = ALL_CURRENCY_CODES.filter((c) => c !== base);

      // Two API calls instead of 60
      const [ratesMap, seriesMap] = await Promise.all([
        fetchLatestRatesBatch(base, quotes),
        fetchTimeSeriesBatch(base, quotes, from, to, group),
      ]);

      if (cancelled) return;

      const valid: LeagueEntry[] = [];
      for (const code of quotes) {
        const rate = ratesMap[code];
        const series = seriesMap[code];
        if (!rate || !series || series.length < 2) continue;
        const first = series[0].rate;
        const last = series[series.length - 1].rate;
        const change = ((last - first) / first) * 100;
        valid.push({ code, currentRate: rate.rate, change });
      }

      valid.sort((a, b) => a.change - b.change);
      setEntries(valid);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [base, period]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-12 bg-bg-surface rounded-[4px] border border-border-subtle animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="py-8 text-center text-text-muted text-sm font-sans">
        No data available
      </div>
    );
  }

  return (
    <div>
      <p className="text-text-secondary font-sans text-xs mb-2">
        Currencies that have gotten cheaper for {base} to buy, ranked from best value down.
      </p>
      <div className="rounded-[4px] overflow-hidden border border-border-subtle">
        {/* Header */}
        <div className="flex items-center px-3 py-2 bg-bg-surface text-text-muted font-sans text-xs tracking-wider uppercase">
          <span className="w-8">#</span>
          <span className="flex-1">Currency</span>
          <span className="w-20 text-right">Rate</span>
          <span className="w-20 text-right">Change</span>
        </div>

        {/* Rows */}
        {entries.map((entry, i) => {
          const isPositive = entry.change >= 0;
          const rowBg = i % 2 === 0 ? "bg-bg-primary" : "bg-bg-raised";
          return (
            <div
              key={entry.code}
              className={`flex items-center px-3 h-11 border-t border-border-subtle ${rowBg}`}
            >
              <span className="w-8 text-text-muted font-sans text-xs tabular-nums">
                {i + 1}
              </span>
              <div className="flex-1 flex items-center gap-2">
                <CountryFlag currencyCode={entry.code} />
                <span className="font-sans text-text-primary text-sm tracking-wider">
                  {entry.code}
                </span>
              </div>
              <span className="w-20 text-right font-sans text-text-secondary text-sm tabular-nums">
                {entry.currentRate.toFixed(2)}
              </span>
              <div className="w-20 flex items-center justify-end gap-1">
                {isPositive ? (
                  <TrendingUp size={12} className="text-positive flex-shrink-0" />
                ) : (
                  <TrendingDown size={12} className="text-negative flex-shrink-0" />
                )}
                <span
                  className={`font-sans text-sm tabular-nums ${
                    isPositive ? "text-positive" : "text-negative"
                  }`}
                >
                  {Math.abs(entry.change).toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
