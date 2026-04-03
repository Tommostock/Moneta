"use client";

import { useState, useEffect } from "react";
import { Trash2, Sun, Moon } from "lucide-react";
import CountryFlag from "@/components/shared/CountryFlag";
import CurrencySelector from "@/components/converter/CurrencySelector";
import { getSettings, saveSettings } from "@/lib/settings";
import { cacheClear } from "@/lib/cache";
import type { AppSettings } from "@/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [pickerTarget, setPickerTarget] = useState<
    "home" | "foreign" | "glance0" | "glance1" | "glance2" | null
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

  const handleThemeToggle = () => {
    const newTheme = settings.theme === "light" ? "dark" : "light";
    update({ theme: newTheme });
    if (newTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    window.dispatchEvent(new Event("moneta:theme-change"));
  };

  const handleCurrencySelect = (code: string) => {
    if (pickerTarget === "home") {
      update({ homeCurrency: code });
    } else if (pickerTarget === "foreign") {
      update({ defaultForeignCurrency: code });
    } else if (pickerTarget?.startsWith("glance")) {
      const index = parseInt(pickerTarget.replace("glance", ""), 10);
      const glance = [...(settings.glanceCurrencies || ["USD", "EUR", "JPY"])];
      glance[index] = code;
      update({ glanceCurrencies: glance });
    }
    setPickerTarget(null);
  };

  const handleClearAll = () => {
    cacheClear();
    localStorage.removeItem("moneta:settings");
    localStorage.removeItem("moneta:initialized");
    document.documentElement.classList.remove("light");
    setSettings(getSettings());
    setShowClearConfirm(false);
  };

  const glance = settings.glanceCurrencies || ["USD", "EUR", "JPY"];
  const isDark = settings.theme !== "light";

  const getPickerSelected = () => {
    if (pickerTarget === "home") return settings.homeCurrency;
    if (pickerTarget === "foreign") return settings.defaultForeignCurrency;
    if (pickerTarget?.startsWith("glance")) {
      const index = parseInt(pickerTarget.replace("glance", ""), 10);
      return glance[index] || "USD";
    }
    return settings.homeCurrency;
  };

  return (
    <div className="min-h-screen px-4 pt-4">
      <h1 className="text-text-muted text-xs font-sans tracking-widest uppercase mb-6">
        Settings
      </h1>

      {/* Appearance */}
      <section className="mb-6">
        <h2 className="text-text-secondary text-sm font-sans mb-3">
          Appearance
        </h2>
        <div className="bg-bg-surface rounded-[4px] border border-border-subtle">
          <button
            onClick={handleThemeToggle}
            className="w-full flex items-center justify-between px-4 min-h-[48px] active:bg-bg-raised transition-colors duration-100"
          >
            <div className="flex items-center gap-3">
              {isDark ? <Moon size={16} className="text-text-secondary" /> : <Sun size={16} className="text-text-secondary" />}
              <span className="text-text-secondary text-sm font-sans">Theme</span>
            </div>
            <span className="font-mono text-text-primary tracking-wider text-sm">
              {isDark ? "Dark" : "Light"}
            </span>
          </button>
        </div>
      </section>

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

      {/* Glance Currencies */}
      <section className="mb-6">
        <h2 className="text-text-secondary text-sm font-sans mb-1">
          Quick Glance Currencies
        </h2>
        <p className="text-text-muted text-xs font-sans mb-3">
          Shown below the converter for at-a-glance conversions
        </p>
        <div className="bg-bg-surface rounded-[4px] border border-border-subtle divide-y divide-border-subtle">
          {glance.map((code, i) => (
            <SettingRow
              key={i}
              label={`Currency ${i + 1}`}
              onClick={() => setPickerTarget(`glance${i}` as "glance0" | "glance1" | "glance2")}
            >
              <div className="flex items-center gap-2">
                <CountryFlag currencyCode={code} />
                <span className="font-mono text-text-primary tracking-wider">
                  {code}
                </span>
              </div>
            </SettingRow>
          ))}
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
                This will clear all cached rates and settings.
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
        selectedCode={getPickerSelected()}
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
