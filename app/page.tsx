"use client";

import { useState, useEffect, useCallback } from "react";
import CountryFlag from "@/components/shared/CountryFlag";
import SplitFlapGroup from "@/components/split-flap/SplitFlapGroup";
import ConverterInput from "@/components/converter/ConverterInput";
import FlipButton from "@/components/converter/FlipButton";
import QuickAmounts from "@/components/converter/QuickAmounts";
import RateInfo from "@/components/converter/RateInfo";
import Sparkline from "@/components/converter/Sparkline";
import TripBanner from "@/components/trip/TripBanner";
import CurrencySelector from "@/components/converter/CurrencySelector";
import { fetchLatestRate } from "@/lib/api/frankfurter";
import { formatAmount } from "@/lib/format";
import { getSettings, addRecentCurrency } from "@/lib/settings";

export default function ConverterPage() {
  const [settings, setSettings] = useState(() => ({
    homeCurrency: "GBP",
    defaultForeignCurrency: "EUR",
    nextTrip: null as ReturnType<typeof getSettings>["nextTrip"],
    recentCurrencies: [] as string[],
  }));

  const [baseCurrency, setBaseCurrency] = useState("EUR");
  const [quoteCurrency, setQuoteCurrency] = useState("GBP");
  const [inputValue, setInputValue] = useState("");
  const [rate, setRate] = useState<number | null>(null);
  const [rateDate, setRateDate] = useState<string>("");
  const [offline, setOffline] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"base" | "quote" | null>(
    null
  );

  // Load settings on mount
  useEffect(() => {
    const s = getSettings();
    setSettings(s);
    setBaseCurrency(s.defaultForeignCurrency || "EUR");
    setQuoteCurrency(s.homeCurrency || "GBP");
  }, []);

  // Fetch rate when currencies change
  useEffect(() => {
    let cancelled = false;
    async function loadRate() {
      try {
        const result = await fetchLatestRate(baseCurrency, quoteCurrency);
        if (!cancelled) {
          setRate(result.rate);
          setRateDate(result.date);
          setOffline(result.offline);
        }
      } catch {
        if (!cancelled) {
          setRate(null);
          setOffline(false);
        }
      }
    }
    loadRate();
    return () => {
      cancelled = true;
    };
  }, [baseCurrency, quoteCurrency]);

  const numericValue = inputValue ? parseFloat(inputValue) : 0;
  const convertedAmount = rate ? numericValue * rate : null;

  const displayResult = convertedAmount !== null && numericValue > 0
    ? formatAmount(convertedAmount).padStart(12, " ")
    : "       0.00";

  const handleFlip = useCallback(() => {
    const newBase = quoteCurrency;
    const newQuote = baseCurrency;
    setBaseCurrency(newBase);
    setQuoteCurrency(newQuote);
    // Invert the input to the converted amount
    if (convertedAmount !== null && convertedAmount > 0) {
      setInputValue(convertedAmount.toFixed(2));
    }
  }, [baseCurrency, quoteCurrency, convertedAmount]);

  const handleQuickAmount = useCallback((amount: number) => {
    setInputValue(amount.toString());
  }, []);

  const handleCurrencySelect = useCallback(
    (code: string) => {
      if (pickerTarget === "base") {
        setBaseCurrency(code);
        addRecentCurrency(code);
      } else if (pickerTarget === "quote") {
        setQuoteCurrency(code);
        addRecentCurrency(code);
      }
      setPickerTarget(null);
    },
    [pickerTarget]
  );

  const quickActiveAmount = [5, 10, 20, 50, 100].includes(numericValue)
    ? numericValue
    : null;

  return (
    <div className="min-h-screen px-4 pt-4">
      {/* Trip banner */}
      {settings.nextTrip && <TripBanner trip={settings.nextTrip} />}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-text-muted text-xs font-sans tracking-widest uppercase">
          MONETA
        </h1>
      </div>

      {/* Source currency row */}
      <div className="bg-bg-surface rounded-[4px] border border-border-subtle p-4 mb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPickerTarget("base")}
            className="flex items-center gap-2 min-h-[44px] px-2 -ml-2 active:bg-bg-raised rounded-[4px] transition-colors duration-100"
          >
            <CountryFlag currencyCode={baseCurrency} />
            <span className="font-mono text-text-primary tracking-wider text-lg">
              {baseCurrency}
            </span>
          </button>
          <div className="flex-1">
            <ConverterInput value={inputValue} onChange={setInputValue} />
          </div>
        </div>
      </div>

      {/* Flip button */}
      <div className="flex justify-center -my-1 relative z-10">
        <FlipButton onFlip={handleFlip} />
      </div>

      {/* Target currency row */}
      <div className="bg-bg-surface rounded-[4px] border border-border-subtle p-4 mt-2 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPickerTarget("quote")}
            className="flex items-center gap-2 min-h-[44px] px-2 -ml-2 active:bg-bg-raised rounded-[4px] transition-colors duration-100"
          >
            <CountryFlag currencyCode={quoteCurrency} />
            <span className="font-mono text-text-primary tracking-wider text-lg">
              {quoteCurrency}
            </span>
          </button>
          <div className="flex-1 flex justify-end">
            <SplitFlapGroup value={displayResult} size="lg" />
          </div>
        </div>
      </div>

      {/* Rate info */}
      <div className="mb-4">
        <RateInfo
          base={baseCurrency}
          quote={quoteCurrency}
          rate={rate}
          offline={offline}
          cacheDate={rateDate}
        />
      </div>

      {/* Quick amounts */}
      <div className="mb-6">
        <QuickAmounts
          onSelect={handleQuickAmount}
          activeAmount={quickActiveAmount}
        />
      </div>

      {/* Sparkline */}
      <div className="mb-4">
        <Sparkline base={baseCurrency} quote={quoteCurrency} />
      </div>

      {/* Currency Picker */}
      <CurrencySelector
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={handleCurrencySelect}
        selectedCode={
          pickerTarget === "base" ? baseCurrency : quoteCurrency
        }
      />
    </div>
  );
}
