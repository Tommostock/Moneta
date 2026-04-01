"use client";

import type { NextTrip } from "@/types";
import { tripStatus } from "@/lib/dates";
import CountryFlag from "@/components/shared/CountryFlag";

interface TripBannerProps {
  trip: NextTrip;
}

export default function TripBanner({ trip }: TripBannerProps) {
  const status = tripStatus(trip.departDate, trip.returnDate);

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary">
      <CountryFlag currencyCode={trip.currency} />
      <span className="font-sans">{trip.name}</span>
      <span className="text-text-muted">—</span>
      <span
        className={`font-sans ${
          status.status === "active" ? "text-accent" : ""
        }`}
      >
        {status.text}
      </span>
    </div>
  );
}
