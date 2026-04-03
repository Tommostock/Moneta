import type { AppSettings } from "@/types";

const SETTINGS_KEY = "moneta:settings";
const INITIALIZED_KEY = "moneta:initialized";

// Map locale language/region to likely home currency
const LOCALE_CURRENCY_MAP: Record<string, string> = {
  "en-GB": "GBP", "en-US": "USD", "en-AU": "AUD", "en-CA": "CAD", "en-NZ": "NZD",
  "en-IE": "EUR", "en-SG": "SGD", "en-ZA": "ZAR", "en-IN": "INR", "en-HK": "HKD",
  "de-DE": "EUR", "de-AT": "EUR", "de-CH": "CHF",
  "fr-FR": "EUR", "fr-BE": "EUR", "fr-CH": "CHF", "fr-CA": "CAD",
  "es-ES": "EUR", "es-MX": "MXN", "es-AR": "ARS", "es-CO": "COP",
  "it-IT": "EUR", "nl-NL": "EUR", "nl-BE": "EUR",
  "pt-BR": "BRL", "pt-PT": "EUR",
  "ja-JP": "JPY", "ko-KR": "KRW", "zh-CN": "CNY", "zh-TW": "TWD", "zh-HK": "HKD",
  "sv-SE": "SEK", "da-DK": "DKK", "nb-NO": "NOK", "nn-NO": "NOK", "fi-FI": "EUR",
  "pl-PL": "PLN", "cs-CZ": "CZK", "hu-HU": "HUF", "ro-RO": "RON", "bg-BG": "BGN",
  "tr-TR": "TRY", "th-TH": "THB", "vi-VN": "VND", "id-ID": "IDR", "ms-MY": "MYR",
  "ru-RU": "RUB", "uk-UA": "UAH", "he-IL": "ILS", "ar-SA": "SAR", "ar-AE": "AED",
};

function detectHomeCurrency(): string {
  if (typeof navigator === "undefined") return "GBP";
  const locale = navigator.language;
  if (LOCALE_CURRENCY_MAP[locale]) return LOCALE_CURRENCY_MAP[locale];
  // Try matching just the language part (e.g. "en" → default to GBP, "de" → EUR)
  const lang = locale.split("-")[0];
  const langDefaults: Record<string, string> = {
    en: "GBP", de: "EUR", fr: "EUR", es: "EUR", it: "EUR", nl: "EUR",
    pt: "EUR", ja: "JPY", ko: "KRW", zh: "CNY", sv: "SEK", da: "DKK",
    nb: "NOK", fi: "EUR", pl: "PLN", cs: "CZK", hu: "HUF", tr: "TRY",
    th: "THB", ru: "RUB", ar: "SAR", he: "ILS",
  };
  return langDefaults[lang] || "GBP";
}

function getDefaultForeign(home: string): string {
  // Pick a sensible foreign currency based on home
  if (home === "EUR") return "USD";
  if (home === "USD") return "EUR";
  return "EUR";
}

const DEFAULT_SETTINGS: AppSettings = {
  homeCurrency: "GBP",
  defaultForeignCurrency: "EUR",
  recentCurrencies: ["EUR", "USD", "JPY", "CHF"],
  favouritePairs: [],
  glanceCurrencies: ["USD", "EUR", "JPY"],
  theme: "dark",
};

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      // First launch: auto-detect from locale
      const initialized = localStorage.getItem(INITIALIZED_KEY);
      if (!initialized) {
        const home = detectHomeCurrency();
        const foreign = getDefaultForeign(home);
        const detected: AppSettings = {
          ...DEFAULT_SETTINGS,
          homeCurrency: home,
          defaultForeignCurrency: foreign,
          recentCurrencies: [foreign, ...DEFAULT_SETTINGS.recentCurrencies.filter(c => c !== foreign)].slice(0, 8),
        };
        localStorage.setItem(INITIALIZED_KEY, "1");
        saveSettings(detected);
        return detected;
      }
      return DEFAULT_SETTINGS;
    }
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

export function addFavouritePair(base: string, quote: string): void {
  const settings = getSettings();
  const pairs = settings.favouritePairs.filter(
    (p) => !(p.base === base && p.quote === quote)
  );
  pairs.unshift({ base, quote });
  settings.favouritePairs = pairs.slice(0, 5);
  saveSettings(settings);
}

export function removeFavouritePair(base: string, quote: string): void {
  const settings = getSettings();
  settings.favouritePairs = settings.favouritePairs.filter(
    (p) => !(p.base === base && p.quote === quote)
  );
  saveSettings(settings);
}

export function reorderFavouritePairs(pairs: { base: string; quote: string }[]): void {
  const settings = getSettings();
  settings.favouritePairs = pairs;
  saveSettings(settings);
}

export function isFavouritePair(base: string, quote: string): boolean {
  const settings = getSettings();
  return settings.favouritePairs.some(
    (p) => p.base === base && p.quote === quote
  );
}
