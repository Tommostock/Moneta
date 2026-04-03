"use client";

import { useRef, useState, useEffect } from "react";
import ConversionTablePage from "./ConversionTablePage";
import { ImageIcon } from "lucide-react";

interface ConversionTableProps {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number | null;
  onRequestWallpaper?: (multiplier: number) => void;
}

const MULTIPLIERS = [1, 10, 100];

export default function ConversionTable({
  baseCurrency,
  quoteCurrency,
  rate,
  onRequestWallpaper,
}: ConversionTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = pageRefs.current.indexOf(
              entry.target as HTMLDivElement
            );
            if (index >= 0) setActivePage(index);
          }
        }
      },
      { root: container, threshold: 0.5 }
    );

    for (const ref of pageRefs.current) {
      if (ref) observer.observe(ref);
    }

    return () => observer.disconnect();
  }, []);

  const handleDotClick = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({
      left: index * container.offsetWidth,
      behavior: "smooth",
    });
  };

  if (rate === null) {
    return (
      <div className="rounded-[4px] border border-border-subtle bg-bg-surface h-[480px] flex items-center justify-center">
        <span className="text-text-muted font-sans text-sm">
          Waiting for rate data
        </span>
      </div>
    );
  }

  return (
    <div>
      {/* Swipeable pages */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
      >
        {MULTIPLIERS.map((mult, i) => (
          <div
            key={mult}
            ref={(el) => { pageRefs.current[i] = el; }}
            className="min-w-full snap-start shrink-0"
          >
            <ConversionTablePage
              baseCurrency={baseCurrency}
              quoteCurrency={quoteCurrency}
              rate={rate}
              multiplier={mult}
            />
          </div>
        ))}
      </div>

      {/* Dots + wallpaper button */}
      <div className="flex items-center justify-center gap-2 py-3">
        <div className="flex items-center gap-2">
          {MULTIPLIERS.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                i === activePage ? "bg-accent" : "bg-text-muted"
              }`}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
        {onRequestWallpaper && (
          <button
            onClick={() => onRequestWallpaper(MULTIPLIERS[activePage])}
            className="ml-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted active:text-accent transition-colors"
            aria-label="Create wallpaper"
          >
            <ImageIcon size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
