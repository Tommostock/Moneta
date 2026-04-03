import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  fetchLatestRate,
  fetchTimeSeries,
  fetchRateOnDate,
  fetchCurrencies,
} from "../frankfurter";

// Mock the cache module
vi.mock("@/lib/cache", () => {
  const store = new Map<string, { data: unknown; fetchedAt: number }>();
  return {
    RATES_TTL: 3_600_000,
    SERIES_TTL: 86_400_000,
    CURRENCIES_TTL: 604_800_000,
    cacheGet: (key: string) => store.get(key) ?? null,
    cacheSet: (key: string, data: unknown) => {
      store.set(key, { data, fetchedAt: Date.now() });
    },
    isExpired: (fetchedAt: number, ttl: number) => Date.now() - fetchedAt > ttl,
    __store: store,
  };
});

// Access the internal store for test setup
async function getCacheStore() {
  const mod = await import("@/lib/cache");
  return (mod as unknown as { __store: Map<string, { data: unknown; fetchedAt: number }> }).__store;
}

beforeEach(async () => {
  vi.restoreAllMocks();
  const store = await getCacheStore();
  store.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

const mockFetch = (data: unknown, ok = true, status = 200) => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(data),
    })
  );
};

const mockFetchError = () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new Error("Network error"))
  );
};

describe("fetchLatestRate", () => {
  it("fetches and returns a rate from the API", async () => {
    const apiResponse = [{ date: "2026-04-01", base: "GBP", quote: "EUR", rate: 1.1893 }];
    mockFetch(apiResponse);

    const result = await fetchLatestRate("GBP", "EUR");
    expect(result.rate).toBe(1.1893);
    expect(result.date).toBe("2026-04-01");
    expect(result.offline).toBe(false);
  });

  it("returns cached rate when not expired", async () => {
    const store = await getCacheStore();
    store.set("rate:GBP:EUR", {
      data: [{ date: "2026-04-01", base: "GBP", quote: "EUR", rate: 1.18 }],
      fetchedAt: Date.now(),
    });

    mockFetch([]); // should not be called
    const result = await fetchLatestRate("GBP", "EUR");
    expect(result.rate).toBe(1.18);
    expect(result.offline).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fetches fresh data when cache is expired", async () => {
    const store = await getCacheStore();
    store.set("rate:GBP:EUR", {
      data: [{ date: "2026-03-31", base: "GBP", quote: "EUR", rate: 1.17 }],
      fetchedAt: Date.now() - 4_000_000, // expired (> 1 hour)
    });

    const apiResponse = [{ date: "2026-04-01", base: "GBP", quote: "EUR", rate: 1.19 }];
    mockFetch(apiResponse);

    const result = await fetchLatestRate("GBP", "EUR");
    expect(result.rate).toBe(1.19);
    expect(result.offline).toBe(false);
  });

  it("falls back to expired cache on network error", async () => {
    const store = await getCacheStore();
    store.set("rate:GBP:EUR", {
      data: [{ date: "2026-03-30", base: "GBP", quote: "EUR", rate: 1.16 }],
      fetchedAt: Date.now() - 4_000_000,
    });

    mockFetchError();
    const result = await fetchLatestRate("GBP", "EUR");
    expect(result.rate).toBe(1.16);
    expect(result.offline).toBe(true);
  });

  it("throws when no cache and network fails", async () => {
    mockFetchError();
    await expect(fetchLatestRate("GBP", "EUR")).rejects.toThrow("No rate data available");
  });

  it("throws on non-ok HTTP response with no cache", async () => {
    mockFetch(null, false, 500);
    await expect(fetchLatestRate("GBP", "EUR")).rejects.toThrow("No rate data available");
  });
});

describe("fetchTimeSeries", () => {
  it("fetches and maps time series data", async () => {
    const apiResponse = [
      { date: "2026-03-01", base: "GBP", quote: "EUR", rate: 1.18 },
      { date: "2026-03-02", base: "GBP", quote: "EUR", rate: 1.19 },
    ];
    mockFetch(apiResponse);

    const result = await fetchTimeSeries("GBP", "EUR", "2026-03-01", "2026-03-02");
    expect(result.data).toEqual([
      { date: "2026-03-01", rate: 1.18 },
      { date: "2026-03-02", rate: 1.19 },
    ]);
    expect(result.fromCache).toBe(false);
  });

  it("returns cached time series when not expired", async () => {
    const store = await getCacheStore();
    store.set("series:GBP:EUR:2026-03-01:2026-03-02:daily", {
      data: [
        { date: "2026-03-01", base: "GBP", quote: "EUR", rate: 1.18 },
      ],
      fetchedAt: Date.now(),
    });

    const result = await fetchTimeSeries("GBP", "EUR", "2026-03-01", "2026-03-02");
    expect(result.fromCache).toBe(true);
    expect(result.data).toEqual([{ date: "2026-03-01", rate: 1.18 }]);
  });

  it("includes group parameter in URL and cache key", async () => {
    mockFetch([{ date: "2026-03-01", base: "GBP", quote: "EUR", rate: 1.18 }]);
    await fetchTimeSeries("GBP", "EUR", "2025-10-01", "2026-04-01", "week");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("&group=week"),
      expect.any(Object)
    );
  });

  it("falls back to expired cache on error", async () => {
    const store = await getCacheStore();
    store.set("series:GBP:EUR:2026-03-01:2026-03-02:daily", {
      data: [{ date: "2026-03-01", base: "GBP", quote: "EUR", rate: 1.17 }],
      fetchedAt: Date.now() - 100_000_000,
    });

    mockFetchError();
    const result = await fetchTimeSeries("GBP", "EUR", "2026-03-01", "2026-03-02");
    expect(result.fromCache).toBe(true);
  });

  it("throws when no cache and network fails", async () => {
    mockFetchError();
    await expect(
      fetchTimeSeries("GBP", "EUR", "2026-03-01", "2026-03-02")
    ).rejects.toThrow("No time series data available");
  });
});

describe("fetchRateOnDate", () => {
  it("fetches a historical rate", async () => {
    const apiResponse = [{ date: "2025-04-01", base: "GBP", quote: "EUR", rate: 1.14 }];
    mockFetch(apiResponse);

    const rate = await fetchRateOnDate("GBP", "EUR", "2025-04-01");
    expect(rate).toBe(1.14);
  });

  it("returns cached historical rate without refetching", async () => {
    const store = await getCacheStore();
    store.set("rate:GBP:EUR:2025-04-01", {
      data: [{ date: "2025-04-01", base: "GBP", quote: "EUR", rate: 1.14 }],
      fetchedAt: Date.now() - 999_999_999, // very old but historical rates never expire
    });

    mockFetch([]);
    const rate = await fetchRateOnDate("GBP", "EUR", "2025-04-01");
    expect(rate).toBe(1.14);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns null on network error with no cache", async () => {
    mockFetchError();
    const rate = await fetchRateOnDate("GBP", "EUR", "2025-04-01");
    expect(rate).toBeNull();
  });

  it("returns null for empty API response", async () => {
    mockFetch([]);
    const rate = await fetchRateOnDate("GBP", "EUR", "2025-04-01");
    expect(rate).toBeNull();
  });
});

describe("fetchCurrencies", () => {
  it("fetches and returns currency list", async () => {
    const apiResponse = [
      { iso_code: "EUR", iso_numeric: "978", name: "Euro", symbol: "EUR" },
      { iso_code: "USD", iso_numeric: "840", name: "US Dollar", symbol: "$" },
    ];
    mockFetch(apiResponse);

    const result = await fetchCurrencies();
    expect(result.data).toHaveLength(2);
    expect(result.data[0].iso_code).toBe("EUR");
    expect(result.fromCache).toBe(false);
  });

  it("returns cached currencies when not expired", async () => {
    const store = await getCacheStore();
    store.set("currencies", {
      data: [{ iso_code: "EUR", iso_numeric: "978", name: "Euro", symbol: "EUR" }],
      fetchedAt: Date.now(),
    });

    const result = await fetchCurrencies();
    expect(result.fromCache).toBe(true);
  });

  it("throws when no cache and network fails", async () => {
    mockFetchError();
    await expect(fetchCurrencies()).rejects.toThrow("No currency data available");
  });
});
