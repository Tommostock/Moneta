"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, TrendingUp, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getSettings } from "@/lib/settings";
import { cacheGet, isExpired, RATES_TTL } from "@/lib/cache";
import type { RateResponse } from "@/types";

function useRateDelta() {
  const [delta, setDelta] = useState<string | null>(null);

  useEffect(() => {
    const s = getSettings();
    const base = s.homeCurrency || "GBP";
    const quote = s.defaultForeignCurrency || "EUR";
    const cacheKey = `rate:${base}:${quote}`;
    const cached = cacheGet<RateResponse[]>(cacheKey);

    if (!cached || isExpired(cached.fetchedAt, RATES_TTL)) return;

    // Check if we have a previous rate stored
    const prevKey = `moneta:prev_rate:${base}:${quote}`;
    const prevRaw = localStorage.getItem(prevKey);
    const currentRate = cached.data[0]?.rate;

    if (prevRaw && currentRate) {
      const prevRate = parseFloat(prevRaw);
      if (prevRate > 0) {
        const change = ((currentRate - prevRate) / prevRate) * 100;
        if (Math.abs(change) >= 0.05) {
          const sign = change > 0 ? "+" : "";
          setDelta(`${sign}${change.toFixed(1)}%`);
        }
      }
    }

    // Store current as "previous" for next comparison
    if (currentRate) {
      localStorage.setItem(prevKey, currentRate.toString());
    }
  }, []);

  return delta;
}

const tabs = [
  { href: "/", label: "Convert", icon: ArrowLeftRight },
  { href: "/rates", label: "Rates", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings2 },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const rateDelta = useRateDelta();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-primary border-t border-border-subtle">
      <div
        className="flex items-center justify-around"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          const showBadge = href === "/rates" && rateDelta && !isActive;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-[64px] min-h-[44px] transition-colors duration-100 ${
                isActive ? "text-accent" : "text-text-muted"
              }`}
            >
              <div className="relative">
                <Icon size={22} />
                {showBadge && (
                  <span
                    className={`absolute -top-2.5 -right-5 text-[8px] font-mono font-medium px-1 py-0.5 rounded-[2px] leading-none ${
                      rateDelta.startsWith("+")
                        ? "bg-positive/20 text-positive"
                        : "bg-negative/20 text-negative"
                    }`}
                  >
                    {rateDelta}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-sans">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
