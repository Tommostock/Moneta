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
  excludeCurrency: string;
  currencies: string[];
}

export default function MultiCurrencyGlance({
  base,
  amount,
  excludeCurrency,
  currencies,
}: MultiCurrencyGlanceProps) {
  const [rates, setRates] = useState<GlanceRate[]>([]);

  // Filter out the base and main target, take up to 3
  const filtered = currencies.filter(
    (c) => c !== base && c !== excludeCurrency
  ).slice(0, 3);

  useEffect(() => {
    let cancelled = false;

    async function loadRates() {
      const results = await Promise.all(
        filtered.map(async (quote) => {
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
  }, [base, excludeCurrency, currencies.join(",")]);

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
