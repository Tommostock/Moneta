"use client";

import { useState, useMemo, useEffect } from "react";
import { X, Search } from "lucide-react";
import CountryFlag from "@/components/shared/CountryFlag";
import {
  ALL_CURRENCY_CODES,
  CURRENCY_NAMES,
} from "@/lib/constants/currencies";
import { getSettings, addRecentCurrency } from "@/lib/settings";

interface CurrencySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
  selectedCode: string;
}

export default function CurrencySelector({
  isOpen,
  onClose,
  onSelect,
  selectedCode,
}: CurrencySelectorProps) {
  const [search, setSearch] = useState("");
  const [recentCurrencies, setRecentCurrencies] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setRecentCurrencies(getSettings().recentCurrencies);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = search.toUpperCase().trim();
    if (!q) return ALL_CURRENCY_CODES;
    return ALL_CURRENCY_CODES.filter(
      (code) =>
        code.includes(q) ||
        (CURRENCY_NAMES[code] || "").toUpperCase().includes(q)
    );
  }, [search]);

  const handleSelect = (code: string) => {
    addRecentCurrency(code);
    onSelect(code);
    onClose();
  };

  if (!isOpen) return null;

  const recentFiltered = recentCurrencies.filter(
    (c) => c !== selectedCode && ALL_CURRENCY_CODES.includes(c)
  );

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top)] pb-2">
        <h2 className="text-lg font-sans text-text-primary">
          Select Currency
        </h2>
        <button
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center text-text-secondary active:text-text-primary"
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 bg-bg-surface rounded-[4px] px-3 h-11 border border-border-subtle">
          <Search size={16} className="text-text-muted flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search currency"
            className="flex-1 bg-transparent text-text-primary font-sans outline-none placeholder:text-text-muted"
            style={{ fontSize: "16px" }}
            autoFocus
          />
        </div>
      </div>

      {/* Currency list */}
      <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        {/* Recent currencies */}
        {!search && recentFiltered.length > 0 && (
          <>
            <div className="px-4 py-1.5 text-xs text-text-muted font-sans uppercase tracking-wider">
              Recent
            </div>
            {recentFiltered.map((code) => (
              <CurrencyRow
                key={`recent-${code}`}
                code={code}
                isSelected={code === selectedCode}
                onSelect={handleSelect}
              />
            ))}
            <div className="mx-4 border-b border-border-warm" />
          </>
        )}

        {/* All currencies */}
        <div className="px-4 py-1.5 text-xs text-text-muted font-sans uppercase tracking-wider">
          All currencies
        </div>
        {filtered.map((code) => (
          <CurrencyRow
            key={code}
            code={code}
            isSelected={code === selectedCode}
            onSelect={handleSelect}
          />
        ))}

        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-text-muted text-sm font-sans">
            No currencies found
          </div>
        )}
      </div>
    </div>
  );
}

function CurrencyRow({
  code,
  isSelected,
  onSelect,
}: {
  code: string;
  isSelected: boolean;
  onSelect: (code: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(code)}
      className={`w-full flex items-center gap-3 px-4 h-12 active:bg-bg-surface transition-colors duration-100 ${
        isSelected ? "bg-bg-raised" : ""
      }`}
    >
      <CountryFlag currencyCode={code} />
      <span className="font-mono text-text-primary tracking-wider text-sm">
        {code}
      </span>
      <span className="font-sans text-text-secondary text-sm flex-1 text-left truncate">
        {CURRENCY_NAMES[code] || code}
      </span>
      {isSelected && (
        <span className="text-accent text-sm font-sans">Selected</span>
      )}
    </button>
  );
}
