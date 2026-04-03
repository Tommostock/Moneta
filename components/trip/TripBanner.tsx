"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { NextTrip } from "@/types";
import { tripStatus } from "@/lib/dates";
import CountryFlag from "@/components/shared/CountryFlag";

interface TripBannerProps {
  trip: NextTrip;
}

export default function TripBanner({ trip }: TripBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const status = tripStatus(trip.departDate, trip.returnDate);

  return (
    <div className="flex items-center justify-between gap-2 px-2 py-2 mb-2 rounded-[4px] border border-border-warm bg-bg-surface">
      <div className="flex items-center gap-2 text-sm">
        <CountryFlag currencyCode={trip.currency} />
        <span className="font-sans text-text-secondary">{trip.name}</span>
        <span className="text-text-muted">—</span>
        <span
          className={`font-sans ${
            status.status === "active" ? "text-accent" : "text-text-secondary"
          }`}
        >
          {status.text}
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="w-8 h-8 flex items-center justify-center text-text-muted active:text-text-secondary rounded-[4px] flex-shrink-0"
        aria-label="Dismiss trip banner"
      >
        <X size={14} />
      </button>
    </div>
  );
}
