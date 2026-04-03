"use client";

import { useState, useEffect } from "react";
import { Trash2, Sun, Moon, AlertTriangle } from "lucide-react";
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
  const [showAtmTip, setShowAtmTip] = useState(false);

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
    <div className="h-[100dvh] px-3 pt-2 flex flex-col" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 56px)" }}>
      <h1 className="text-text-muted text-xs font-sans tracking-widest uppercase mb-2 shrink-0">
        Settings
      </h1>

      {/* Appearance + Currency Preferences — combined */}
      <div className="bg-bg-surface rounded-[4px] border border-border-subtle divide-y divide-border-subtle mb-2 shrink-0">
        <button
          onClick={handleThemeToggle}
          className="w-full flex items-center justify-between px-3 min-h-[40px] active:bg-bg-raised transition-colors"
        >
          <div className="flex items-center gap-2">
            {isDark ? <Moon size={14} className="text-text-secondary" /> : <Sun size={14} className="text-text-secondary" />}
            <span className="text-text-secondary text-xs font-sans">Theme</span>
          </div>
          <span className="font-sans text-text-primary tracking-wider font-medium text-xs">
            {isDark ? "Dark" : "Light"}
          </span>
        </button>
        <SettingRow label="Home currency" onClick={() => setPickerTarget("home")}>
          <div className="flex items-center gap-1.5">
            <CountryFlag currencyCode={settings.homeCurrency} />
            <span className="font-sans text-text-primary tracking-wider font-medium text-xs">
              {settings.homeCurrency}
            </span>
          </div>
        </SettingRow>
        <SettingRow label="Foreign currency" onClick={() => setPickerTarget("foreign")}>
          <div className="flex items-center gap-1.5">
            <CountryFlag currencyCode={settings.defaultForeignCurrency} />
            <span className="font-sans text-text-primary tracking-wider font-medium text-xs">
              {settings.defaultForeignCurrency}
            </span>
          </div>
        </SettingRow>
      </div>

      {/* Glance Currencies — compact */}
      <div className="mb-2 shrink-0">
        <p className="text-text-muted text-[10px] font-sans mb-1">Quick Glance Currencies</p>
        <div className="bg-bg-surface rounded-[4px] border border-border-subtle divide-y divide-border-subtle">
          {glance.map((code, i) => (
            <SettingRow
              key={i}
              label={`Slot ${i + 1}`}
              onClick={() => setPickerTarget(`glance${i}` as "glance0" | "glance1" | "glance2")}
            >
              <div className="flex items-center gap-1.5">
                <CountryFlag currencyCode={code} />
                <span className="font-sans text-text-primary tracking-wider font-medium text-xs">
                  {code}
                </span>
              </div>
            </SettingRow>
          ))}
        </div>
      </div>

      {/* ATM Travel Tip */}
      <div className="mb-2 shrink-0">
        <button
          onClick={() => setShowAtmTip(!showAtmTip)}
          className="w-full bg-accent/10 rounded-[4px] border border-accent/20 px-3 py-2 flex items-center gap-2 active:bg-accent/15 haptic-tap transition-colors"
        >
          <AlertTriangle size={14} className="text-accent shrink-0" />
          <span className="font-sans text-accent text-xs font-medium flex-1 text-left">
            ATM Tip for Travellers
          </span>
          <span className="text-accent/50 text-xs">{showAtmTip ? "Hide" : "Show"}</span>
        </button>
        {showAtmTip && (
          <div className="bg-bg-surface rounded-b-[4px] border border-t-0 border-border-subtle px-3 py-2 animate-fade-in">
            <p className="text-text-secondary text-[11px] font-sans leading-relaxed">
              When using ATMs abroad, always choose to be charged in the <span className="text-text-primary font-medium">local currency</span>.
              If the ATM offers to convert to your home currency (Dynamic Currency Conversion), decline it — their rate is
              always worse than your bank&apos;s. This simple choice can save you 3-5% on every withdrawal.
            </p>
          </div>
        )}
      </div>

      {/* About — minimal */}
      <div className="bg-bg-surface rounded-[4px] border border-border-subtle px-3 py-2 mb-2 shrink-0">
        <div className="flex items-baseline justify-between">
          <span className="text-text-primary font-sans text-xs font-medium">MONETA</span>
          <span className="text-text-muted text-[10px] font-sans">v1.0.0</span>
        </div>
        <p className="text-text-muted text-[10px] font-sans mt-0.5">
          Rates from ECB via Frankfurter API. Updated once per business day ~16:00 CET.
        </p>
        <LastUpdatedInfo />
      </div>

      {/* Clear data — compact */}
      <div className="shrink-0">
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-[4px] border border-border-subtle text-negative font-sans text-xs active:bg-bg-raised transition-colors"
          >
            <Trash2 size={12} />
            Clear all data
          </button>
        ) : (
          <div className="bg-bg-surface rounded-[4px] border border-border-subtle p-3">
            <p className="text-text-secondary text-xs font-sans mb-2">Clear all cached rates and settings?</p>
            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                className="flex-1 h-8 rounded-[4px] bg-negative text-bg-primary font-sans text-xs active:opacity-80"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 h-8 rounded-[4px] bg-bg-raised text-text-secondary font-sans text-xs border border-border-subtle active:bg-bg-surface"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Currency Picker */}
      <CurrencySelector
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={handleCurrencySelect}
        selectedCode={getPickerSelected()}
      />

      {/* ATM Tip Bottom Sheet */}
      {showAtmTip && false /* inline instead of sheet */}
    </div>
  );
}

function LastUpdatedInfo() {
  const [info, setInfo] = useState<{ date: string; fetchedAt: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("moneta:last_update");
      if (raw) setInfo(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  if (!info) return null;

  const rateDate = new Date(info.date).toLocaleDateString("en-GB", {
    day: "numeric", month: "short",
  });
  const fetchedTime = new Date(info.fetchedAt).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <p className="text-text-muted text-[10px] font-sans mt-1">
      Rate: {rateDate} / Fetched: {fetchedTime}
    </p>
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
      className="w-full flex items-center justify-between px-3 min-h-[40px] active:bg-bg-raised transition-colors duration-100"
    >
      <span className="text-text-secondary text-xs font-sans">{label}</span>
      {children}
    </button>
  );
}
