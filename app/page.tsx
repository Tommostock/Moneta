"use client";

import { useState, useEffect, useCallback } from "react";
import CountryFlag from "@/components/shared/CountryFlag";
import SegmentDisplay from "@/components/display/SegmentDisplay";
import ConverterInput from "@/components/converter/ConverterInput";
import FlipButton from "@/components/converter/FlipButton";
import ConversionTable from "@/components/converter/ConversionTable";
import MultiCurrencyGlance from "@/components/converter/MultiCurrencyGlance";
import CurrencySelector from "@/components/converter/CurrencySelector";
import FavouritePairs from "@/components/converter/FavouritePairs";
import WallpaperCreator from "@/components/converter/WallpaperCreator";
import TipCalculator from "@/components/converter/TipCalculator";
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
    theme: "dark" as "dark" | "light",
  }));

  const [baseCurrency, setBaseCurrencyRaw] = useState("EUR");
  const [quoteCurrency, setQuoteCurrencyRaw] = useState("GBP");
  const [inputValue, setInputValue] = useState("1");
  const [rate, setRate] = useState<number | null>(null);
  const [pickerTarget, setPickerTarget] = useState<"base" | "quote" | null>(null);
  const [showCopied, setShowCopied] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [showWallpaper, setShowWallpaper] = useState(false);
  const [wallpaperMultiplier, setWallpaperMultiplier] = useState(10);
  const [showTip, setShowTip] = useState(false);
  const [flipRotation, setFlipRotation] = useState(0);

  // Wrap setters to persist converter state across tab switches
  const setBaseCurrency = useCallback((code: string) => {
    setBaseCurrencyRaw(code);
    try { sessionStorage.setItem("moneta:converter_base", code); } catch {}
  }, []);

  const setQuoteCurrency = useCallback((code: string) => {
    setQuoteCurrencyRaw(code);
    try { sessionStorage.setItem("moneta:converter_quote", code); } catch {}
  }, []);

  useEffect(() => {
    const s = getSettings();
    setSettings(s);
    // Restore from session (survives tab switches) or fall back to settings
    const sessionBase = sessionStorage.getItem("moneta:converter_base");
    const sessionQuote = sessionStorage.getItem("moneta:converter_quote");
    setBaseCurrencyRaw(sessionBase || s.defaultForeignCurrency || "EUR");
    setQuoteCurrencyRaw(sessionQuote || s.homeCurrency || "GBP");
  }, []);

  useEffect(() => {
    setIsFavourite(isFavouritePair(baseCurrency, quoteCurrency));
  }, [baseCurrency, quoteCurrency]);

  useEffect(() => {
    let cancelled = false;
    async function loadRate() {
      try {
        const result = await fetchLatestRate(baseCurrency, quoteCurrency);
        if (!cancelled) {
          setRate(result.rate);
          try {
            localStorage.setItem("moneta:last_update", JSON.stringify({
              date: result.date,
              fetchedAt: result.fetchedAt,
            }));
          } catch { /* ignore */ }
        }
      } catch {
        if (!cancelled) setRate(null);
      }
    }
    loadRate();
    return () => { cancelled = true; };
  }, [baseCurrency, quoteCurrency]);

  const parsed = parseFloat(inputValue);
  const numericValue = isNaN(parsed) ? 0 : parsed;
  const convertedAmount = rate ? numericValue * rate : null;

  const displayResult = rate === null
    ? "--.--"
    : convertedAmount !== null && numericValue > 0
      ? formatAmount(convertedAmount)
      : "0.00";

  const handleFlip = useCallback(() => {
    setFlipRotation((r) => r + 180);
    setBaseCurrency(quoteCurrency);
    setQuoteCurrency(baseCurrency);
    if (convertedAmount !== null && convertedAmount > 0) {
      setInputValue(convertedAmount.toFixed(2));
    }
  }, [baseCurrency, quoteCurrency, convertedAmount, setBaseCurrency, setQuoteCurrency]);

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
    navigator.clipboard.writeText(formatAmount(convertedAmount)).then(() => {
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

  return (
    <div className="h-[100dvh] px-3 pt-2 flex flex-col" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 56px)" }}>
      {/* Header + favourite star */}
      <div className="mb-2 flex items-center justify-between shrink-0">
        <h1 className="text-text-muted text-xs font-sans tracking-widest uppercase">
          MONETA
        </h1>
        <button
          onClick={handleToggleFavourite}
          className="min-w-[44px] min-h-[32px] flex items-center justify-center -mr-2 active:opacity-70 haptic-tap transition-opacity"
          aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
        >
          <Star
            size={14}
            className={isFavourite ? "text-accent fill-accent" : "text-text-muted"}
          />
        </button>
      </div>

      {/* Favourite pairs */}
      {settings.favouritePairs.length > 0 && (
        <div className="mb-2 shrink-0">
          <FavouritePairs
            pairs={settings.favouritePairs}
            currentBase={baseCurrency}
            currentQuote={quoteCurrency}
            onSelect={handleSelectPair}
            onReorder={() => setSettings(getSettings())}
          />
        </div>
      )}

      {/* Converter — card with depth shadow */}
      <div className="relative mb-2 shrink-0" style={{ boxShadow: "0 1px 3px var(--theme-flap-shadow)" }}>
        {/* Source row */}
        <div className="bg-bg-surface rounded-t-[4px] border border-border-subtle px-3 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPickerTarget("base")}
              className="flex items-center gap-1.5 min-h-[36px] px-1.5 -ml-1.5 active:bg-bg-raised rounded-[4px] haptic-tap transition-colors duration-100"
            >
              <CountryFlag currencyCode={baseCurrency} />
              <span className="font-sans text-text-primary tracking-wider text-base font-medium">
                {baseCurrency}
              </span>
            </button>
            <div className="flex-1">
              <ConverterInput value={inputValue} onChange={setInputValue} />
            </div>
          </div>
        </div>

        {/* Target row */}
        <div className="bg-bg-surface rounded-b-[4px] border border-t-0 border-border-subtle px-3 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPickerTarget("quote")}
              className="flex items-center gap-1.5 min-h-[36px] px-1.5 -ml-1.5 active:bg-bg-raised rounded-[4px] haptic-tap transition-colors duration-100"
            >
              <CountryFlag currencyCode={quoteCurrency} />
              <span className="font-sans text-text-primary tracking-wider text-base font-medium">
                {quoteCurrency}
              </span>
            </button>
            <div className="flex-1 flex justify-end relative">
              <button
                onClick={handleCopyResult}
                className="flex items-center active:opacity-70 haptic-tap transition-opacity"
                aria-label="Copy converted amount"
              >
                <SegmentDisplay value={displayResult} size={28} flash />
              </button>
              {showCopied && (
                <span className="absolute -bottom-5 right-0 text-xs text-accent font-sans animate-fade-in">
                  Copied
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Flip button */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <FlipButton onFlip={handleFlip} rotation={flipRotation} />
        </div>
      </div>

      {/* Conversion table */}
      <div className="shrink-0 mb-2">
        <ConversionTable
          baseCurrency={baseCurrency}
          quoteCurrency={quoteCurrency}
          rate={rate}
          onFlip={handleFlip}
          flipRotation={flipRotation}
        />
      </div>

      {/* Quick glance currencies */}
      <div className="shrink-0 mb-2">
        <MultiCurrencyGlance
          base={settings.homeCurrency}
          amount={1}
          excludeCurrency=""
          currencies={settings.glanceCurrencies}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 shrink-0">
        {numericValue > 0 && rate !== null && (
          <button
            onClick={() => setShowTip(true)}
            className="flex-1 h-11 rounded-[4px] border border-border-subtle bg-bg-surface text-text-secondary font-sans text-sm tracking-wider active:bg-bg-raised haptic-tap transition-colors"
          >
            Tip Calculator
          </button>
        )}
        <button
          onClick={() => {
            setWallpaperMultiplier(10);
            setShowWallpaper(true);
          }}
          className="flex-1 h-11 rounded-[4px] border border-border-subtle bg-bg-surface text-text-secondary font-sans text-sm tracking-wider active:bg-bg-raised haptic-tap transition-colors"
        >
          Create Wallpaper
        </button>
      </div>

      {/* Currency Picker */}
      <CurrencySelector
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={handleCurrencySelect}
        selectedCode={pickerTarget === "base" ? baseCurrency : quoteCurrency}
      />

      {/* Tip Calculator — uses the input amount in the base currency */}
      {rate !== null && (
        <TipCalculator
          isOpen={showTip}
          onClose={() => setShowTip(false)}
          amount={numericValue}
          currency={baseCurrency}
          homeCurrency={quoteCurrency}
          rate={rate}
        />
      )}

      {/* Wallpaper Creator */}
      {rate !== null && (
        <WallpaperCreator
          isOpen={showWallpaper}
          onClose={() => setShowWallpaper(false)}
          baseCurrency={baseCurrency}
          quoteCurrency={quoteCurrency}
          rate={rate}
          multiplier={wallpaperMultiplier}
        />
      )}
    </div>
  );
}
