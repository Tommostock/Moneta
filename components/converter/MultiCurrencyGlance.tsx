"use client";

import { useEffect, useState } from "react";
import CountryFlag from "@/components/shared/CountryFlag";
import { fetchLatestRate } from "@/lib/api/frankfurter";
import { formatAmount } from "@/lib/format";

interface GlanceRate {
  quote: string;
  rate: number | null;
}

interface MultiCurrencyGlanceProps {
  base: string;
  amount: number;
  excludeCurrency: string; // The main target currency to exclude
}

// Common currencies to show — will exclude the main pair currencies
const GLANCE_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD"];

export default function MultiCurrencyGlance({
  base,
  amount,
  excludeCurrency,
}: MultiCurrencyGlanceProps) {
  const [rates, setRates] = useState<GlanceRate[]>([]);

  // Pick up to 3 currencies that aren't the base or main target
  const currencies = GLANCE_CURRENCIES.filter(
    (c) => c !== base && c !== excludeCurrency
  ).slice(0, 3);

  useEffect(() => {
    let cancelled = false;

    async function loadRates() {
      const results = await Promise.all(
        currencies.map(async (quote) => {
          try {
            const r = await fetchLatestRate(base, quote);
            return { quote, rate: r.rate };
          } catch {
            return { quote, rate: null };
          }
        })
      );
      if (!cancelled) setRates(results);
    }

    loadRates();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, excludeCurrency]);

  if (rates.length === 0) return null;

  return (
    <div className="flex gap-2">
      {rates.map(({ quote, rate }) => {
        const converted = rate && amount > 0 ? amount * rate : null;
        return (
          <div
            key={quote}
            className="flex-1 bg-bg-surface rounded-[4px] border border-border-subtle px-3 py-2"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <CountryFlag currencyCode={quote} />
              <span className="font-mono text-text-muted text-xs tracking-wider">
                {quote}
              </span>
            </div>
            <span className="font-mono text-text-secondary text-sm">
              {converted !== null ? formatAmount(converted) : "--.--"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
