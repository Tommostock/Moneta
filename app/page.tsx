"use client";

import { useState, useEffect, useCallback } from "react";
import CountryFlag from "@/components/shared/CountryFlag";
import SplitFlapGroup from "@/components/split-flap/SplitFlapGroup";
import ConverterInput from "@/components/converter/ConverterInput";
import FlipButton from "@/components/converter/FlipButton";
import QuickAmounts from "@/components/converter/QuickAmounts";
import Sparkline from "@/components/converter/Sparkline";
import CurrencySelector from "@/components/converter/CurrencySelector";
import MultiCurrencyGlance from "@/components/converter/MultiCurrencyGlance";
import FavouritePairs from "@/components/converter/FavouritePairs";
import { fetchLatestRate } from "@/lib/api/frankfurter";
import { formatAmount } from "@/lib/format";
import { getSettings, addRecentCurrency, addFavouritePair, isFavouritePair, removeFavouritePair } from "@/lib/settings";
import { Star } from "lucide-react";

export default function ConverterPage() {
  const [settings, setSettings] = useState(() => ({
    homeCurrency: "GBP",
    defaultForeignCurrency: "EUR",
    recentCurrencies: [] as string[],
    favouritePairs: [] as ReturnType<typeof getSettings>["favouritePairs"],
    glanceCurrencies: ["USD", "EUR", "JPY"] as string[],
  }));

  const [baseCurrency, setBaseCurrency] = useState("EUR");
  const [quoteCurrency, setQuoteCurrency] = useState("GBP");
  const [inputValue, setInputValue] = useState("");
  const [rate, setRate] = useState<number | null>(null);
  const [pickerTarget, setPickerTarget] = useState<"base" | "quote" | null>(
    null
  );
  const [showCopied, setShowCopied] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const s = getSettings();
    setSettings(s);
    setBaseCurrency(s.defaultForeignCurrency || "EUR");
    setQuoteCurrency(s.homeCurrency || "GBP");
  }, []);

  // Check favourite status when currencies change
  useEffect(() => {
    setIsFavourite(isFavouritePair(baseCurrency, quoteCurrency));
  }, [baseCurrency, quoteCurrency]);

  // Fetch rate when currencies change
  useEffect(() => {
    let cancelled = false;
    async function loadRate() {
      try {
        const result = await fetchLatestRate(baseCurrency, quoteCurrency);
        if (!cancelled) {
          setRate(result.rate);
        }
      } catch {
        if (!cancelled) {
          setRate(null);
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
    ? formatAmount(convertedAmount)
    : rate !== null
      ? "0.00"
      : "--.--";

  const handleFlip = useCallback(() => {
    const newBase = quoteCurrency;
    const newQuote = baseCurrency;
    setBaseCurrency(newBase);
    setQuoteCurrency(newQuote);
    if (convertedAmount !== null && convertedAmount > 0) {
      setInputValue(convertedAmount.toFixed(2));
    }
  }, [baseCurrency, quoteCurrency, convertedAmount]);

  const handleQuickAmount = useCallback((amount: number) => {
    setInputValue(amount.toString());
  }, []);

  const handleToggleFavourite = useCallback(() => {
    if (isFavourite) {
      removeFavouritePair(baseCurrency, quoteCurrency);
      setIsFavourite(false);
    } else {
      addFavouritePair(baseCurrency, quoteCurrency);
      setIsFavourite(true);
    }
    setSettings(getSettings());
  }, [baseCurrency, quoteCurrency, isFavourite]);

  const handleSelectPair = useCallback((base: string, quote: string) => {
    setBaseCurrency(base);
    setQuoteCurrency(quote);
  }, []);

  const handleCopyResult = useCallback(() => {
    if (convertedAmount === null || numericValue <= 0) return;
    const text = formatAmount(convertedAmount);
    navigator.clipboard.writeText(text).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 1500);
    }).catch(() => {});
  }, [convertedAmount, numericValue]);

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
      {/* Header + favourite star */}
      <div className="mb-6 animate-fade-up stagger-1 flex items-center justify-between">
        <h1 className="text-text-muted text-xs font-sans tracking-widest uppercase">
          MONETA
        </h1>
        <button
          onClick={handleToggleFavourite}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 active:opacity-70 transition-opacity"
          aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
        >
          <Star
            size={16}
            className={isFavourite ? "text-accent fill-accent" : "text-text-muted"}
          />
        </button>
      </div>

      {/* Favourite pairs */}
      {settings.favouritePairs.length > 0 && (
        <div className="mb-3 animate-fade-up stagger-2">
          <FavouritePairs
            pairs={settings.favouritePairs}
            currentBase={baseCurrency}
            currentQuote={quoteCurrency}
            onSelect={handleSelectPair}
          />
        </div>
      )}

      {/* Source currency row */}
      <div className="bg-bg-surface rounded-[4px] border border-border-subtle p-4 mb-2 animate-fade-up stagger-2">
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
      <div className="flex justify-center -my-1 relative z-10 animate-fade-up stagger-3">
        <FlipButton onFlip={handleFlip} />
      </div>

      {/* Target currency row */}
      <div className="bg-bg-surface rounded-[4px] border border-border-subtle p-4 mt-2 mb-4 animate-fade-up stagger-3">
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
          <div className="flex-1 flex justify-end relative">
            <button
              onClick={handleCopyResult}
              className="flex items-center active:opacity-70 transition-opacity"
              aria-label="Copy converted amount"
            >
              <SplitFlapGroup value={displayResult} size="lg" />
            </button>
            {showCopied && (
              <span className="absolute -bottom-6 right-0 text-xs text-accent font-sans animate-fade-in">
                Copied
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick amounts */}
      <div className="mb-6 animate-fade-up stagger-4">
        <QuickAmounts
          onSelect={handleQuickAmount}
          activeAmount={quickActiveAmount}
        />
      </div>

      {/* Multi-currency glance */}
      <div className="mb-4 animate-fade-up stagger-5">
        <MultiCurrencyGlance
          base={baseCurrency}
          amount={numericValue}
          excludeCurrency={quoteCurrency}
          currencies={settings.glanceCurrencies}
        />
      </div>

      {/* Sparkline */}
      <div className="mb-4 animate-fade-up stagger-6">
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
