"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import CountryFlag from "@/components/shared/CountryFlag";
import SplitFlapGroup from "@/components/split-flap/SplitFlapGroup";
import TimePeriodPills, {
  periodToDays,
  periodToGroup,
} from "@/components/rates/TimePeriodPills";
import type { Period } from "@/components/rates/TimePeriodPills";
import RateContext from "@/components/rates/RateContext";
import CurrencySelector from "@/components/converter/CurrencySelector";
import { fetchLatestRate, fetchTimeSeries, fetchRateOnDate } from "@/lib/api/frankfurter";
import { formatRate } from "@/lib/format";
import { daysAgoDate, todayDate } from "@/lib/dates";
import { getSettings } from "@/lib/settings";
import type { TimeSeriesPoint } from "@/types";

// Dynamic import to keep Recharts out of the main bundle
const RateChart = dynamic(() => import("@/components/rates/RateChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] flex items-center justify-center">
      <div className="h-[2px] w-3/4 bg-bg-raised animate-pulse rounded-full" />
    </div>
  ),
});

const periodLabels: Record<Period, string> = {
  "7D": "7 days",
  "30D": "30 days",
  "90D": "90 days",
  "6M": "6 months",
  "1Y": "1 year",
};

export default function RatesPage() {
  const [base, setBase] = useState("GBP");
  const [quote, setQuote] = useState("EUR");
  const [period, setPeriod] = useState<Period>("30D");
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [series, setSeries] = useState<TimeSeriesPoint[]>([]);
  const [pickerTarget, setPickerTarget] = useState<"base" | "quote" | null>(null);
  const [rate6mAgo, setRate6mAgo] = useState<number | null>(null);
  const [rate1yAgo, setRate1yAgo] = useState<number | null>(null);

  // Load settings
  useEffect(() => {
    const s = getSettings();
    setBase(s.homeCurrency || "GBP");
    setQuote(s.defaultForeignCurrency || "EUR");
  }, []);

  // Fetch current rate
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await fetchLatestRate(base, quote);
        if (!cancelled) setCurrentRate(result.rate);
      } catch {
        if (!cancelled) setCurrentRate(null);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [base, quote]);

  // Fetch time series
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const days = periodToDays(period);
        const group = periodToGroup(period);
        const result = await fetchTimeSeries(
          base,
          quote,
          daysAgoDate(days),
          todayDate(),
          group
        );
        if (!cancelled) setSeries(result.data);
      } catch {
        if (!cancelled) setSeries([]);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [base, quote, period]);

  // Fetch historical reference rates when pair changes
  useEffect(() => {
    let cancelled = false;
    async function loadHistorical() {
      const [r6m, r1y] = await Promise.all([
        fetchRateOnDate(base, quote, daysAgoDate(182)),
        fetchRateOnDate(base, quote, daysAgoDate(365)),
      ]);
      if (!cancelled) {
        setRate6mAgo(r6m);
        setRate1yAgo(r1y);
      }
    }
    loadHistorical();
    return () => { cancelled = true; };
  }, [base, quote]);

  const rateDisplay = currentRate
    ? formatRate(currentRate).padStart(10, " ")
    : "    --.----";

  const handleCurrencySelect = (code: string) => {
    if (pickerTarget === "base") setBase(code);
    else if (pickerTarget === "quote") setQuote(code);
    setPickerTarget(null);
  };

  return (
    <div className="min-h-screen px-4 pt-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-text-muted text-xs font-sans tracking-widest uppercase mb-4">
          Rate Watcher
        </h1>

        {/* Currency pair */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setPickerTarget("base")}
            className="flex items-center gap-2 min-h-[44px] px-2 active:bg-bg-raised rounded-[4px] transition-colors"
          >
            <CountryFlag currencyCode={base} />
            <span className="font-mono text-text-primary tracking-wider text-xl">
              {base}
            </span>
          </button>
          <span className="text-text-muted font-mono">/</span>
          <button
            onClick={() => setPickerTarget("quote")}
            className="flex items-center gap-2 min-h-[44px] px-2 active:bg-bg-raised rounded-[4px] transition-colors"
          >
            <CountryFlag currencyCode={quote} />
            <span className="font-mono text-text-primary tracking-wider text-xl">
              {quote}
            </span>
          </button>
        </div>

        {/* Current rate */}
        <div className="mb-4">
          <SplitFlapGroup value={rateDisplay} size="lg" />
        </div>
      </div>

      {/* Time period pills */}
      <div className="mb-4">
        <TimePeriodPills selected={period} onSelect={setPeriod} />
      </div>

      {/* Chart */}
      <div className="mb-4 bg-bg-surface rounded-[4px] border border-border-subtle p-2">
        <RateChart data={series} />
      </div>

      {/* Rate context */}
      <div className="mb-4">
        <RateContext
          base={base}
          quote={quote}
          data={series}
          daysLabel={periodLabels[period]}
        />
      </div>

      {/* Historical reference */}
      {(rate1yAgo !== null || rate6mAgo !== null) && (
        <div className="mb-6 bg-bg-surface rounded-[4px] border border-border-subtle p-4">
          <p className="text-text-muted text-xs font-sans tracking-widest uppercase mb-3">
            Historical Reference
          </p>
          <div className="flex flex-col gap-2">
            {rate1yAgo !== null && (
              <div className="flex justify-between items-baseline">
                <span className="text-text-secondary font-sans text-sm">1 year ago</span>
                <span className="font-mono text-text-primary text-sm">{formatRate(rate1yAgo)}</span>
              </div>
            )}
            {rate6mAgo !== null && (
              <div className="flex justify-between items-baseline">
                <span className="text-text-secondary font-sans text-sm">6 months ago</span>
                <span className="font-mono text-text-primary text-sm">{formatRate(rate6mAgo)}</span>
              </div>
            )}
            {currentRate !== null && (
              <div className="flex justify-between items-baseline border-t border-border-subtle pt-2 mt-1">
                <span className="text-text-secondary font-sans text-sm">Today</span>
                <span className="font-mono text-accent text-sm">{formatRate(currentRate)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Currency Picker */}
      <CurrencySelector
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={handleCurrencySelect}
        selectedCode={pickerTarget === "base" ? base : quote}
      />
    </div>
  );
}
