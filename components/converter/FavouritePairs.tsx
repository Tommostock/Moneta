"use client";

import type { CurrencyPair } from "@/types";
import CountryFlag from "@/components/shared/CountryFlag";

interface FavouritePairsProps {
  pairs: CurrencyPair[];
  currentBase: string;
  currentQuote: string;
  onSelect: (base: string, quote: string) => void;
}

export default function FavouritePairs({
  pairs,
  currentBase,
  currentQuote,
  onSelect,
}: FavouritePairsProps) {
  if (pairs.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {pairs.map((pair) => {
        const isActive =
          pair.base === currentBase && pair.quote === currentQuote;
        return (
          <button
            key={`${pair.base}-${pair.quote}`}
            onClick={() => onSelect(pair.base, pair.quote)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border text-xs font-sans tracking-wider whitespace-nowrap transition-colors duration-100 shrink-0 ${
              isActive
                ? "bg-accent/15 border-accent/40 text-accent"
                : "bg-bg-surface border-border-subtle text-text-secondary active:bg-bg-raised"
            }`}
          >
            <CountryFlag currencyCode={pair.base} />
            <span>{pair.base}</span>
            <span className="text-text-muted">/</span>
            <CountryFlag currencyCode={pair.quote} />
            <span>{pair.quote}</span>
          </button>
        );
      })}
    </div>
  );
}
