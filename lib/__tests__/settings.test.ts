import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getSettings,
  saveSettings,
  updateSetting,
  addRecentCurrency,
  addFavouritePair,
  removeFavouritePair,
  isFavouritePair,
} from "../settings";
import type { AppSettings } from "@/types";

beforeEach(() => {
  localStorage.clear();
});

const DEFAULT_SETTINGS: AppSettings = {
  homeCurrency: "GBP",
  defaultForeignCurrency: "EUR",
  recentCurrencies: ["EUR", "USD", "JPY", "CHF"],
  favouritePairs: [],
  glanceCurrencies: ["USD", "EUR", "JPY"],
  theme: "dark",
};

describe("getSettings", () => {
  it("returns default settings when nothing is stored and already initialized", () => {
    // Mark as initialized so it doesn't trigger locale detection
    localStorage.setItem("moneta:initialized", "1");
    const settings = getSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it("returns stored settings merged with defaults", () => {
    localStorage.setItem("moneta:initialized", "1");
    const partial = { homeCurrency: "USD", defaultForeignCurrency: "JPY" };
    localStorage.setItem("moneta:settings", JSON.stringify(partial));
    const settings = getSettings();
    expect(settings.homeCurrency).toBe("USD");
    expect(settings.defaultForeignCurrency).toBe("JPY");
    // Defaults filled in
    expect(settings.recentCurrencies).toEqual(["EUR", "USD", "JPY", "CHF"]);
  });

  it("auto-detects home currency on first launch", () => {
    // Simulate en-US locale
    vi.stubGlobal("navigator", { language: "en-US" });
    const settings = getSettings();
    expect(settings.homeCurrency).toBe("USD");
    expect(settings.defaultForeignCurrency).toBe("EUR");
    vi.unstubAllGlobals();
  });

  it("falls back to GBP for unknown locale", () => {
    vi.stubGlobal("navigator", { language: "xx-YY" });
    const settings = getSettings();
    expect(settings.homeCurrency).toBe("GBP");
    vi.unstubAllGlobals();
  });

  it("detects EUR for German locale", () => {
    vi.stubGlobal("navigator", { language: "de-DE" });
    const settings = getSettings();
    expect(settings.homeCurrency).toBe("EUR");
    expect(settings.defaultForeignCurrency).toBe("USD");
    vi.unstubAllGlobals();
  });
});

describe("saveSettings", () => {
  it("persists settings to localStorage", () => {
    saveSettings({ ...DEFAULT_SETTINGS, homeCurrency: "AUD" });
    const raw = localStorage.getItem("moneta:settings");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.homeCurrency).toBe("AUD");
  });
});

describe("updateSetting", () => {
  it("updates a single key and returns the full settings", () => {
    localStorage.setItem("moneta:initialized", "1");
    const result = updateSetting("homeCurrency", "CAD");
    expect(result.homeCurrency).toBe("CAD");
    // Verify it persisted
    const stored = JSON.parse(localStorage.getItem("moneta:settings")!);
    expect(stored.homeCurrency).toBe("CAD");
  });
});

describe("addRecentCurrency", () => {
  it("adds a currency to the front of the recent list", () => {
    localStorage.setItem("moneta:initialized", "1");
    saveSettings(DEFAULT_SETTINGS);
    addRecentCurrency("AUD");
    const settings = getSettings();
    expect(settings.recentCurrencies[0]).toBe("AUD");
  });

  it("moves an existing currency to the front", () => {
    localStorage.setItem("moneta:initialized", "1");
    saveSettings(DEFAULT_SETTINGS);
    addRecentCurrency("JPY"); // already in list at index 2
    const settings = getSettings();
    expect(settings.recentCurrencies[0]).toBe("JPY");
    // No duplicates
    expect(settings.recentCurrencies.filter((c) => c === "JPY")).toHaveLength(1);
  });

  it("limits to 8 recent currencies", () => {
    localStorage.setItem("moneta:initialized", "1");
    saveSettings(DEFAULT_SETTINGS);
    const extras = ["AUD", "CAD", "NZD", "SGD", "HKD", "SEK"];
    for (const code of extras) {
      addRecentCurrency(code);
    }
    const settings = getSettings();
    expect(settings.recentCurrencies.length).toBeLessThanOrEqual(8);
  });
});

describe("addFavouritePair", () => {
  it("adds a pair to favourites", () => {
    localStorage.setItem("moneta:initialized", "1");
    saveSettings(DEFAULT_SETTINGS);
    addFavouritePair("GBP", "EUR");
    const settings = getSettings();
    expect(settings.favouritePairs).toEqual([{ base: "GBP", quote: "EUR" }]);
  });

  it("moves duplicate pair to front instead of adding twice", () => {
    localStorage.setItem("moneta:initialized", "1");
    saveSettings(DEFAULT_SETTINGS);
    addFavouritePair("GBP", "EUR");
    addFavouritePair("USD", "JPY");
    addFavouritePair("GBP", "EUR");
    const settings = getSettings();
    expect(settings.favouritePairs[0]).toEqual({ base: "GBP", quote: "EUR" });
    expect(settings.favouritePairs.filter((p) => p.base === "GBP" && p.quote === "EUR")).toHaveLength(1);
  });

  it("limits to 5 favourite pairs", () => {
    localStorage.setItem("moneta:initialized", "1");
    saveSettings(DEFAULT_SETTINGS);
    const pairs = [
      ["GBP", "EUR"], ["USD", "JPY"], ["AUD", "NZD"],
      ["CAD", "CHF"], ["SEK", "NOK"], ["HKD", "SGD"],
    ] as const;
    for (const [b, q] of pairs) {
      addFavouritePair(b, q);
    }
    const settings = getSettings();
    expect(settings.favouritePairs.length).toBeLessThanOrEqual(5);
  });
});

describe("removeFavouritePair", () => {
  it("removes a pair from favourites", () => {
    localStorage.setItem("moneta:initialized", "1");
    saveSettings({ ...DEFAULT_SETTINGS, favouritePairs: [{ base: "GBP", quote: "EUR" }] });
    removeFavouritePair("GBP", "EUR");
    const settings = getSettings();
    expect(settings.favouritePairs).toEqual([]);
  });

  it("does nothing if pair is not in favourites", () => {
    localStorage.setItem("moneta:initialized", "1");
    saveSettings(DEFAULT_SETTINGS);
    removeFavouritePair("GBP", "EUR");
    const settings = getSettings();
    expect(settings.favouritePairs).toEqual([]);
  });
});

describe("isFavouritePair", () => {
  it("returns true for a favourite pair", () => {
    localStorage.setItem("moneta:initialized", "1");
    saveSettings({ ...DEFAULT_SETTINGS, favouritePairs: [{ base: "GBP", quote: "EUR" }] });
    expect(isFavouritePair("GBP", "EUR")).toBe(true);
  });

  it("returns false for a non-favourite pair", () => {
    localStorage.setItem("moneta:initialized", "1");
    saveSettings(DEFAULT_SETTINGS);
    expect(isFavouritePair("GBP", "EUR")).toBe(false);
  });
});
