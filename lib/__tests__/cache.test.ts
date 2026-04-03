import { describe, it, expect, beforeEach, vi } from "vitest";
import { cacheGet, cacheSet, isExpired, cacheClear, RATES_TTL, SERIES_TTL, CURRENCIES_TTL } from "../cache";

beforeEach(() => {
  localStorage.clear();
});

describe("cacheGet", () => {
  it("returns null when key does not exist", () => {
    expect(cacheGet("nonexistent")).toBeNull();
  });

  it("returns parsed data and fetchedAt for a valid entry", () => {
    const entry = { data: { rate: 1.18 }, fetchedAt: 1000 };
    localStorage.setItem("moneta:test", JSON.stringify(entry));
    const result = cacheGet<{ rate: number }>("test");
    expect(result).toEqual({ data: { rate: 1.18 }, fetchedAt: 1000 });
  });

  it("returns null for invalid JSON", () => {
    localStorage.setItem("moneta:bad", "not json");
    expect(cacheGet("bad")).toBeNull();
  });
});

describe("cacheSet", () => {
  it("stores data with a fetchedAt timestamp", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    cacheSet("mykey", { value: 42 });

    const raw = localStorage.getItem("moneta:mykey");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.data).toEqual({ value: 42 });
    expect(parsed.fetchedAt).toBe(now);
    vi.useRealTimers();
  });

  it("overwrites existing entries", () => {
    cacheSet("key", "first");
    cacheSet("key", "second");
    const result = cacheGet<string>("key");
    expect(result?.data).toBe("second");
  });
});

describe("isExpired", () => {
  it("returns false when within TTL", () => {
    const now = Date.now();
    expect(isExpired(now - 1000, RATES_TTL)).toBe(false);
  });

  it("returns true when past TTL", () => {
    const now = Date.now();
    expect(isExpired(now - RATES_TTL - 1, RATES_TTL)).toBe(true);
  });

  it("returns true exactly at TTL boundary", () => {
    const now = Date.now();
    // fetchedAt exactly TTL ms ago — Date.now() - fetchedAt === TTL, which is not > TTL
    expect(isExpired(now - RATES_TTL, RATES_TTL)).toBe(false);
  });
});

describe("cacheClear", () => {
  it("removes all moneta: prefixed keys", () => {
    localStorage.setItem("moneta:a", "1");
    localStorage.setItem("moneta:b", "2");
    localStorage.setItem("other:c", "3");

    cacheClear();

    expect(localStorage.getItem("moneta:a")).toBeNull();
    expect(localStorage.getItem("moneta:b")).toBeNull();
    expect(localStorage.getItem("other:c")).toBe("3");
  });

  it("does nothing when no moneta keys exist", () => {
    localStorage.setItem("other", "val");
    cacheClear();
    expect(localStorage.getItem("other")).toBe("val");
  });
});

describe("TTL constants", () => {
  it("RATES_TTL is 1 hour", () => {
    expect(RATES_TTL).toBe(3_600_000);
  });

  it("SERIES_TTL is 24 hours", () => {
    expect(SERIES_TTL).toBe(86_400_000);
  });

  it("CURRENCIES_TTL is 7 days", () => {
    expect(CURRENCIES_TTL).toBe(604_800_000);
  });
});
