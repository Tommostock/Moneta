"use client";

import { CURRENCY_COUNTRY_MAP } from "@/lib/constants/currencies";

interface CountryFlagProps {
  currencyCode: string;
  className?: string;
}

export default function CountryFlag({
  currencyCode,
  className = "",
}: CountryFlagProps) {
  const countryCode = CURRENCY_COUNTRY_MAP[currencyCode];

  if (!countryCode) {
    // Fallback: render a neutral placeholder
    return (
      <span
        className={`inline-block w-6 h-4 rounded-sm bg-bg-raised ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className={`fi fi-${countryCode} ${className}`}
      role="img"
      aria-label={`${currencyCode} flag`}
    />
  );
}
