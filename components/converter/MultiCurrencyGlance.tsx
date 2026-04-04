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
            className="flex-1 h-11 bg-bg-surface rounded-[4px] border border-border-subtle px-2 flex items-center gap-1.5"
          >
            <CountryFlag currencyCode={quote} />
            <span className="font-sans text-text-muted text-[10px] tracking-wider">
              {quote}
            </span>
            <span className="font-sans text-text-secondary text-[11px] tabular-nums font-medium ml-auto">
              {converted !== null ? formatAmount(converted) : "--.--"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
