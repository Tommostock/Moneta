"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import CountryFlag from "@/components/shared/CountryFlag";
import CurrencySelector from "@/components/converter/CurrencySelector";
import { getSettings, saveSettings } from "@/lib/settings";
import { cacheClear } from "@/lib/cache";
import type { AppSettings, NextTrip } from "@/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [pickerTarget, setPickerTarget] = useState<
    "home" | "foreign" | "trip" | null
  >(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  if (!settings) return null;

  const update = (partial: Partial<AppSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    saveSettings(next);
  };

  const updateTrip = (partial: Partial<NextTrip>) => {
    const trip = settings.nextTrip || {
      name: "",
      currency: "EUR",
      departDate: "",
      returnDate: "",
    };
    const nextTrip = { ...trip, ...partial };
    update({ nextTrip });
  };

  const handleCurrencySelect = (code: string) => {
    if (pickerTarget === "home") update({ homeCurrency: code });
    else if (pickerTarget === "foreign") update({ defaultForeignCurrency: code });
    else if (pickerTarget === "trip") updateTrip({ currency: code });
    setPickerTarget(null);
  };

  const handleClearAll = () => {
    cacheClear();
    localStorage.removeItem("moneta:settings");
    setSettings(getSettings());
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen px-4 pt-4">
      <h1 className="text-text-muted text-xs font-sans tracking-widest uppercase mb-6">
        Settings
      </h1>

      {/* Currency Preferences */}
      <section className="mb-6">
        <h2 className="text-text-secondary text-sm font-sans mb-3">
          Currency Preferences
        </h2>
        <div className="bg-bg-surface rounded-[4px] border border-border-subtle divide-y divide-border-subtle">
          <SettingRow
            label="Home currency"
            onClick={() => setPickerTarget("home")}
          >
            <div className="flex items-center gap-2">
              <CountryFlag currencyCode={settings.homeCurrency} />
              <span className="font-mono text-text-primary tracking-wider">
                {settings.homeCurrency}
              </span>
            </div>
          </SettingRow>
          <SettingRow
            label="Default foreign currency"
            onClick={() => setPickerTarget("foreign")}
          >
            <div className="flex items-center gap-2">
              <CountryFlag currencyCode={settings.defaultForeignCurrency} />
              <span className="font-mono text-text-primary tracking-wider">
                {settings.defaultForeignCurrency}
              </span>
            </div>
          </SettingRow>
        </div>
      </section>

      {/* Next Trip */}
      <section className="mb-6">
        <h2 className="text-text-secondary text-sm font-sans mb-3">
          Next Trip
        </h2>
        <div className="bg-bg-surface rounded-[4px] border border-border-subtle divide-y divide-border-subtle">
          <div className="px-4 py-3">
            <label className="block text-text-secondary text-xs font-sans mb-1">
              Destination
            </label>
            <input
              type="text"
              value={settings.nextTrip?.name || ""}
              onChange={(e) => updateTrip({ name: e.target.value })}
              placeholder="e.g. Rome"
              className="w-full bg-transparent text-text-primary font-sans outline-none placeholder:text-text-muted"
              style={{ fontSize: "16px" }}
            />
          </div>
          <SettingRow
            label="Currency"
            onClick={() => setPickerTarget("trip")}
          >
            <div className="flex items-center gap-2">
              <CountryFlag
                currencyCode={settings.nextTrip?.currency || "EUR"}
              />
              <span className="font-mono text-text-primary tracking-wider">
                {settings.nextTrip?.currency || "EUR"}
              </span>
            </div>
          </SettingRow>
          <div className="px-4 py-3">
            <label className="block text-text-secondary text-xs font-sans mb-1">
              Departure
            </label>
            <input
              type="date"
              value={settings.nextTrip?.departDate || ""}
              onChange={(e) => updateTrip({ departDate: e.target.value })}
              className="w-full bg-transparent text-text-primary font-mono outline-none"
              style={{ fontSize: "16px", colorScheme: "dark" }}
            />
          </div>
          <div className="px-4 py-3">
            <label className="block text-text-secondary text-xs font-sans mb-1">
              Return
            </label>
            <input
              type="date"
              value={settings.nextTrip?.returnDate || ""}
              onChange={(e) => updateTrip({ returnDate: e.target.value })}
              className="w-full bg-transparent text-text-primary font-mono outline-none"
              style={{ fontSize: "16px", colorScheme: "dark" }}
            />
          </div>
          {settings.nextTrip?.name && (
            <div className="px-4 py-3">
              <button
                onClick={() => update({ nextTrip: null })}
                className="text-negative text-sm font-sans active:opacity-70"
              >
                Remove trip
              </button>
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section className="mb-6">
        <h2 className="text-text-secondary text-sm font-sans mb-3">About</h2>
        <div className="bg-bg-surface rounded-[4px] border border-border-subtle p-4 space-y-2">
          <p className="text-text-primary font-sans text-sm">MONETA</p>
          <p className="text-text-muted text-xs font-sans">
            Currency converter and rate tracker
          </p>
          <p className="text-text-muted text-xs font-sans">Version 1.0.0</p>
          <p className="text-text-muted text-xs font-sans">
            Rates from Frankfurter API / European Central Bank
          </p>
        </div>
      </section>

      {/* Data */}
      <section className="mb-6">
        <h2 className="text-text-secondary text-sm font-sans mb-3">Data</h2>
        <div className="bg-bg-surface rounded-[4px] border border-border-subtle">
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center gap-3 px-4 h-12 text-negative font-sans text-sm active:bg-bg-raised transition-colors"
            >
              <Trash2 size={16} />
              Clear all data
            </button>
          ) : (
            <div className="p-4 space-y-3">
              <p className="text-text-secondary text-sm font-sans">
                This will clear all cached rates, settings, and trip data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleClearAll}
                  className="flex-1 h-11 rounded-[4px] bg-negative text-bg-primary font-sans text-sm active:opacity-80"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 h-11 rounded-[4px] bg-bg-raised text-text-secondary font-sans text-sm border border-border-subtle active:bg-bg-surface"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Currency Picker */}
      <CurrencySelector
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={handleCurrencySelect}
        selectedCode={
          pickerTarget === "home"
            ? settings.homeCurrency
            : pickerTarget === "foreign"
              ? settings.defaultForeignCurrency
              : settings.nextTrip?.currency || "EUR"
        }
      />
    </div>
  );
}

function SettingRow({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 min-h-[48px] active:bg-bg-raised transition-colors duration-100"
    >
      <span className="text-text-secondary text-sm font-sans">{label}</span>
      {children}
    </button>
  );
}
