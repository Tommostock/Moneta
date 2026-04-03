export interface CachedRate {
  base: string;
  quote: string;
  rate: number;
  date: string;
  fetchedAt: number;
}

export interface TimeSeriesPoint {
  date: string;
  rate: number;
}

export interface CachedTimeSeries {
  base: string;
  quote: string;
  period: string;
  data: TimeSeriesPoint[];
  fetchedAt: number;
}

export interface CurrencyPair {
  base: string;
  quote: string;
}

export interface AppSettings {
  homeCurrency: string;
  defaultForeignCurrency: string;
  recentCurrencies: string[];
  favouritePairs: CurrencyPair[];
  glanceCurrencies: string[];
  theme: "dark" | "light";
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  countryCode?: string;
}

export interface RateResponse {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

export interface CurrencyResponse {
  iso_code: string;
  iso_numeric: string;
  name: string;
  symbol: string;
}
