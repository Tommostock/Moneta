const PREFIX = "moneta:";

// TTL constants in milliseconds
export const RATES_TTL = 60 * 60 * 1000; // 1 hour
export const SERIES_TTL = 24 * 60 * 60 * 1000; // 24 hours
export const CURRENCIES_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

export function cacheGet<T>(key: string): { data: T; fetchedAt: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry<T> = { data, fetchedAt: Date.now() };
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function isExpired(fetchedAt: number, ttl: number): boolean {
  return Date.now() - fetchedAt > ttl;
}

export function cacheClear(): void {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach((k) => localStorage.removeItem(k));
}
