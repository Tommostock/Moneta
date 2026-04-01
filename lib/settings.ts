import type { AppSettings, NextTrip } from "@/types";

const SETTINGS_KEY = "moneta:settings";

const DEFAULT_SETTINGS: AppSettings = {
  homeCurrency: "GBP",
  defaultForeignCurrency: "EUR",
  nextTrip: null,
  recentCurrencies: ["EUR", "USD", "JPY", "CHF"],
};

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // silently fail
  }
}

export function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): AppSettings {
  const settings = getSettings();
  settings[key] = value;
  saveSettings(settings);
  return settings;
}

export function addRecentCurrency(code: string): void {
  const settings = getSettings();
  const recent = settings.recentCurrencies.filter((c) => c !== code);
  recent.unshift(code);
  settings.recentCurrencies = recent.slice(0, 8);
  saveSettings(settings);
}

export function setNextTrip(trip: NextTrip | null): void {
  updateSetting("nextTrip", trip);
}
