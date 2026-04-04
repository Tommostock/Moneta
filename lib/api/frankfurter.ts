import type { RateResponse, CurrencyResponse, TimeSeriesPoint } from "@/types";
import {
  cacheGet,
  cacheSet,
  isExpired,
  RATES_TTL,
  SERIES_TTL,
  CURRENCIES_TTL,
} from "@/lib/cache";

const BASE_URL = "https://api.frankfurter.dev/v2";
const TIMEOUT_MS = 5000;
const BATCH_TIMEOUT_MS = 15000;

async function fetchWithTimeout(url: string, timeoutMs = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(id);
  }
}

// Fetch a direct rate from the API (no cache logic)
async function fetchDirectRate(
  base: string,
  quote: string
): Promise<RateResponse[]> {
  const res = await fetchWithTimeout(
    `${BASE_URL}/rates?base=${base}&quotes=${quote}`
  );
  const data: RateResponse[] = await res.json();
  if (!data.length || data[0].rate === undefined) {
    throw new Error(`No rate returned for ${base}/${quote}`);
  }
  return data;
}

// Cross-rate fallback via EUR when direct rate fails
async function fetchCrossRate(
  base: string,
  quote: string
): Promise<RateResponse[]> {
  const [baseToEur, quoteToEur] = await Promise.all([
    fetchDirectRate("EUR", base),
    fetchDirectRate("EUR", quote),
  ]);
  const crossRate = quoteToEur[0].rate / baseToEur[0].rate;
  return [{
    date: baseToEur[0].date,
    base,
    quote,
    rate: crossRate,
  }];
}

// Latest rate for a currency pair
export async function fetchLatestRate(
  base: string,
  quote: string
): Promise<{ rate: number; date: string; fetchedAt: number; offline: boolean }> {
  const cacheKey = `rate:${base}:${quote}`;
  const cached = cacheGet<RateResponse[]>(cacheKey);

  if (cached && !isExpired(cached.fetchedAt, RATES_TTL)) {
    const entry = cached.data[0];
    return { rate: entry.rate, date: entry.date, fetchedAt: cached.fetchedAt, offline: false };
  }

  try {
    let data: RateResponse[];
    try {
      data = await fetchDirectRate(base, quote);
    } catch {
      // Direct rate failed — try cross-rate via EUR
      data = await fetchCrossRate(base, quote);
    }
    cacheSet(cacheKey, data);
    const now = Date.now();
    return { rate: data[0].rate, date: data[0].date, fetchedAt: now, offline: false };
  } catch {
    // Fallback to cache even if expired
    if (cached) {
      const entry = cached.data[0];
      return { rate: entry.rate, date: entry.date, fetchedAt: cached.fetchedAt, offline: true };
    }
    throw new Error("No rate data available");
  }
}

// Time series for chart data
export async function fetchTimeSeries(
  base: string,
  quote: string,
  from: string,
  to: string,
  group?: "week" | "month"
): Promise<{ data: TimeSeriesPoint[]; fromCache: boolean }> {
  const groupKey = group || "daily";
  const cacheKey = `series:${base}:${quote}:${from}:${to}:${groupKey}`;
  const cached = cacheGet<RateResponse[]>(cacheKey);

  if (cached && !isExpired(cached.fetchedAt, SERIES_TTL)) {
    return {
      data: cached.data.map((d) => ({ date: d.date, rate: d.rate })),
      fromCache: true,
    };
  }

  try {
    let url = `${BASE_URL}/rates?base=${base}&quotes=${quote}&from=${from}&to=${to}`;
    if (group) url += `&group=${group}`;
    const res = await fetchWithTimeout(url);
    const data: RateResponse[] = await res.json();
    cacheSet(cacheKey, data);
    return {
      data: data.map((d) => ({ date: d.date, rate: d.rate })),
      fromCache: false,
    };
  } catch {
    if (cached) {
      return {
        data: cached.data.map((d) => ({ date: d.date, rate: d.rate })),
        fromCache: true,
      };
    }
    throw new Error("No time series data available");
  }
}

// Single rate on a specific date (for historical reference)
export async function fetchRateOnDate(
  base: string,
  quote: string,
  date: string
): Promise<number | null> {
  const cacheKey = `rate:${base}:${quote}:${date}`;
  const cached = cacheGet<RateResponse[]>(cacheKey);

  // Historical rates never change — cache indefinitely
  if (cached) {
    return cached.data[0]?.rate ?? null;
  }

  try {
    const res = await fetchWithTimeout(
      `${BASE_URL}/rates?base=${base}&quotes=${quote}&from=${date}&to=${date}`
    );
    const data: RateResponse[] = await res.json();
    if (!data.length) return null;
    cacheSet(cacheKey, data);
    return data[0].rate;
  } catch {
    return null;
  }
}

// Batch latest rates for multiple quotes in a single API call
export async function fetchLatestRatesBatch(
  base: string,
  quotes: string[]
): Promise<Record<string, { rate: number; date: string }>> {
  const cacheKey = `rates_batch:${base}:${quotes.join(",")}`;
  const cached = cacheGet<RateResponse[]>(cacheKey);

  if (cached && !isExpired(cached.fetchedAt, RATES_TTL)) {
    const result: Record<string, { rate: number; date: string }> = {};
    for (const entry of cached.data) {
      result[entry.quote] = { rate: entry.rate, date: entry.date };
    }
    return result;
  }

  try {
    const res = await fetchWithTimeout(
      `${BASE_URL}/rates?base=${base}&quotes=${quotes.join(",")}`,
      BATCH_TIMEOUT_MS
    );
    const data: RateResponse[] = await res.json();
    cacheSet(cacheKey, data);
    const result: Record<string, { rate: number; date: string }> = {};
    for (const entry of data) {
      result[entry.quote] = { rate: entry.rate, date: entry.date };
    }
    return result;
  } catch {
    if (cached) {
      const result: Record<string, { rate: number; date: string }> = {};
      for (const entry of cached.data) {
        result[entry.quote] = { rate: entry.rate, date: entry.date };
      }
      return result;
    }
    return {};
  }
}

// Batch time series for multiple quotes in a single API call
export async function fetchTimeSeriesBatch(
  base: string,
  quotes: string[],
  from: string,
  to: string,
  group?: "week" | "month"
): Promise<Record<string, TimeSeriesPoint[]>> {
  const groupKey = group || "daily";
  const cacheKey = `series_batch:${base}:${quotes.join(",")}:${from}:${to}:${groupKey}`;
  const cached = cacheGet<RateResponse[]>(cacheKey);

  if (cached && !isExpired(cached.fetchedAt, SERIES_TTL)) {
    return groupByQuote(cached.data);
  }

  try {
    let url = `${BASE_URL}/rates?base=${base}&quotes=${quotes.join(",")}&from=${from}&to=${to}`;
    if (group) url += `&group=${group}`;
    const res = await fetchWithTimeout(url, BATCH_TIMEOUT_MS);
    const data: RateResponse[] = await res.json();
    cacheSet(cacheKey, data);
    return groupByQuote(data);
  } catch {
    if (cached) {
      return groupByQuote(cached.data);
    }
    return {};
  }
}

function groupByQuote(data: RateResponse[]): Record<string, TimeSeriesPoint[]> {
  const result: Record<string, TimeSeriesPoint[]> = {};
  for (const entry of data) {
    if (!result[entry.quote]) result[entry.quote] = [];
    result[entry.quote].push({ date: entry.date, rate: entry.rate });
  }
  return result;
}

// Full currency list
export async function fetchCurrencies(): Promise<{
  data: CurrencyResponse[];
  fromCache: boolean;
}> {
  const cacheKey = "currencies";
  const cached = cacheGet<CurrencyResponse[]>(cacheKey);

  if (cached && !isExpired(cached.fetchedAt, CURRENCIES_TTL)) {
    return { data: cached.data, fromCache: true };
  }

  try {
    const res = await fetchWithTimeout(`${BASE_URL}/currencies`);
    const data: CurrencyResponse[] = await res.json();
    cacheSet(cacheKey, data);
    return { data, fromCache: false };
  } catch {
    if (cached) {
      return { data: cached.data, fromCache: true };
    }
    throw new Error("No currency data available");
  }
}
