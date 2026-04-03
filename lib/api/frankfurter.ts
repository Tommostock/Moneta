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

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(id);
  }
}

// Latest rate for a currency pair
export async function fetchLatestRate(
  base: string,
  quote: string
): Promise<{ rate: number; date: string; offline: boolean }> {
  const cacheKey = `rate:${base}:${quote}`;
  const cached = cacheGet<RateResponse[]>(cacheKey);

  if (cached && !isExpired(cached.fetchedAt, RATES_TTL)) {
    const entry = cached.data[0];
    return { rate: entry.rate, date: entry.date, offline: false };
  }

  try {
    const res = await fetchWithTimeout(
      `${BASE_URL}/rates?base=${base}&quotes=${quote}`
    );
    const data: RateResponse[] = await res.json();
    cacheSet(cacheKey, data);
    return { rate: data[0].rate, date: data[0].date, offline: false };
  } catch {
    // Fallback to cache even if expired
    if (cached) {
      const entry = cached.data[0];
      return { rate: entry.rate, date: entry.date, offline: true };
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

// Rate on a specific date (for historical reference)
export async function fetchRateOnDate(
  base: string,
  quote: string,
  date: string
): Promise<number | null> {
  const cacheKey = `rate:${base}:${quote}:${date}`;
  const cached = cacheGet<RateResponse[]>(cacheKey);

  if (cached && !isExpired(cached.fetchedAt, SERIES_TTL)) {
    return cached.data[0]?.rate ?? null;
  }

  try {
    const res = await fetchWithTimeout(
      `${BASE_URL}/rates?base=${base}&quotes=${quote}&from=${date}&to=${date}`
    );
    const data: RateResponse[] = await res.json();
    if (data.length === 0) return null;
    cacheSet(cacheKey, data);
    return data[0].rate;
  } catch {
    if (cached && cached.data[0]) {
      return cached.data[0].rate;
    }
    return null;
  }
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
