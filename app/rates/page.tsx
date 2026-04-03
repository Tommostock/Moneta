"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import CountryFlag from "@/components/shared/CountryFlag";
import SegmentDisplay from "@/components/display/SegmentDisplay";
import TimePeriodPills, {
  periodToDays,
  periodToGroup,
} from "@/components/rates/TimePeriodPills";
import type { Period } from "@/components/rates/TimePeriodPills";
import RateContext from "@/components/rates/RateContext";
import CurrencySelector from "@/components/converter/CurrencySelector";
import { fetchLatestRate, fetchTimeSeries, fetchRateOnDate } from "@/lib/api/frankfurter";
import { daysAgoDate, todayDate } from "@/lib/dates";
import { getSettings } from "@/lib/settings";
import { CURRENCY_SYMBOLS } from "@/lib/constants/currencies";
import type { TimeSeriesPoint } from "@/types";

const RateChart = dynamic(() => import("@/components/rates/RateChart"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
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

function formatFriendlyRate(base: string, quote: string, rate: number): string {
  const baseSymbol = CURRENCY_SYMBOLS[base] || base;
  const quoteSymbol = CURRENCY_SYMBOLS[quote] || quote;
  return `${baseSymbol}1 = ${quoteSymbol}${rate.toFixed(2)}`;
}

export default function RatesPage() {
  const [base, setBase] = useState("GBP");
  const [quote, setQuote] = useState("EUR");
  const [period, setPeriod] = useState<Period>("30D");
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [series, setSeries] = useState<TimeSeriesPoint[]>([]);
  const [pickerTarget, setPickerTarget] = useState<"base" | "quote" | null>(null);
  const [rate6mAgo, setRate6mAgo] = useState<number | null>(null);
  const [rate1yAgo, setRate1yAgo] = useState<number | null>(null);

  useEffect(() => {
    const s = getSettings();
    setBase(s.homeCurrency || "GBP");
    setQuote(s.defaultForeignCurrency || "EUR");
  }, []);

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

  useEffect(() => {
    let cancelled = false;
    async function loadHistorical() {
      const results = await Promise.allSettled([
        fetchRateOnDate(base, quote, daysAgoDate(182)),
        fetchRateOnDate(base, quote, daysAgoDate(365)),
      ]);
      if (!cancelled) {
        setRate6mAgo(results[0].status === "fulfilled" ? results[0].value : null);
        setRate1yAgo(results[1].status === "fulfilled" ? results[1].value : null);
      }
    }
    loadHistorical();
    return () => { cancelled = true; };
  }, [base, quote]);

  const handleCurrencySelect = (code: string) => {
    if (pickerTarget === "base") setBase(code);
    else if (pickerTarget === "quote") setQuote(code);
    setPickerTarget(null);
  };

  return (
    <div className="h-[100dvh] px-3 pt-2 flex flex-col" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 56px)" }}>
      {/* Header — compact */}
      <div className="mb-1 shrink-0">
        <h1 className="text-text-muted text-xs font-sans tracking-widest uppercase mb-1.5">
          Rate Watcher
        </h1>

        {/* Currency pair + rate on one row */}
        <div className="flex items-center gap-2 mb-1.5">
          <button
            onClick={() => setPickerTarget("base")}
            className="flex items-center gap-1 min-h-[32px] px-1 active:bg-bg-raised rounded-[4px] haptic-tap transition-colors"
          >
            <CountryFlag currencyCode={base} />
            <span className="font-sans text-text-primary tracking-wider text-sm font-medium">
              {base}
            </span>
          </button>
          <span className="text-text-muted font-sans text-sm">/</span>
          <button
            onClick={() => setPickerTarget("quote")}
            className="flex items-center gap-1 min-h-[32px] px-1 active:bg-bg-raised rounded-[4px] haptic-tap transition-colors"
          >
            <CountryFlag currencyCode={quote} />
            <span className="font-sans text-text-primary tracking-wider text-sm font-medium">
              {quote}
            </span>
          </button>
          <div className="ml-auto flex items-end gap-1">
            {currentRate !== null ? (
              <>
                <span className="text-text-secondary text-sm font-sans">
                  {CURRENCY_SYMBOLS[base] || base}1 = {CURRENCY_SYMBOLS[quote] || quote}
                </span>
                <SegmentDisplay value={currentRate.toFixed(2)} size={20} />
              </>
            ) : (
              <SegmentDisplay value="--.--" size={20} />
            )}
          </div>
        </div>
      </div>

      {/* Time period pills */}
      <div className="mb-1.5 shrink-0">
        <TimePeriodPills selected={period} onSelect={setPeriod} />
      </div>

      {/* Chart — fills available space */}
      <div className="flex-1 min-h-0 mb-1.5 bg-bg-surface rounded-[4px] border border-border-subtle p-1.5">
        <RateChart data={series} />
      </div>

      {/* Rate context — compact */}
      <div className="mb-1 shrink-0">
        <RateContext
          base={base}
          quote={quote}
          data={series}
          daysLabel={periodLabels[period]}
        />
      </div>

      {/* Historical reference — compact inline */}
      {(rate1yAgo !== null || rate6mAgo !== null) && (
        <div className="bg-bg-surface rounded-[4px] border border-border-subtle px-3 py-2 shrink-0">
          <div className="flex items-center gap-4 text-xs font-sans">
            {rate1yAgo !== null && (
              <div className="flex items-center gap-1">
                <span className="text-text-muted">1Y</span>
                <span className="text-text-primary tabular-nums">{formatFriendlyRate(base, quote, rate1yAgo)}</span>
              </div>
            )}
            {rate6mAgo !== null && (
              <div className="flex items-center gap-1">
                <span className="text-text-muted">6M</span>
                <span className="text-text-primary tabular-nums">{formatFriendlyRate(base, quote, rate6mAgo)}</span>
              </div>
            )}
            {currentRate !== null && (
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-text-muted">Now</span>
                <span className="text-accent tabular-nums font-medium">{formatFriendlyRate(base, quote, currentRate)}</span>
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
