"use client";

import { useState, useRef, useCallback } from "react";
import type { CurrencyPair } from "@/types";
import CountryFlag from "@/components/shared/CountryFlag";
import { reorderFavouritePairs } from "@/lib/settings";

interface FavouritePairsProps {
  pairs: CurrencyPair[];
  currentBase: string;
  currentQuote: string;
  onSelect: (base: string, quote: string) => void;
  onReorder?: () => void;
}

export default function FavouritePairs({
  pairs,
  currentBase,
  currentQuote,
  onSelect,
  onReorder,
}: FavouritePairsProps) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [localPairs, setLocalPairs] = useState<CurrencyPair[] | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startX = useRef(0);
  const dragIndex = useRef<number | null>(null);

  const displayPairs = localPairs || pairs;

  const handleTouchStart = useCallback((index: number, e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    longPressTimer.current = setTimeout(() => {
      setDragging(index);
      dragIndex.current = index;
      setLocalPairs([...pairs]);
    }, 400);
  }, [pairs]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragging === null || !localPairs) {
      // If moved before long press triggered, cancel it
      if (longPressTimer.current) {
        const dx = Math.abs(e.touches[0].clientX - startX.current);
        if (dx > 10) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
      return;
    }
    e.preventDefault();

    // Find which pill we're over
    const touch = e.touches[0];
    const elements = document.querySelectorAll("[data-pair-index]");
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (touch.clientX >= rect.left && touch.clientX <= rect.right) {
        const overIndex = parseInt(el.getAttribute("data-pair-index") || "0", 10);
        if (overIndex !== dragIndex.current && dragIndex.current !== null) {
          const newPairs = [...localPairs];
          const [moved] = newPairs.splice(dragIndex.current, 1);
          newPairs.splice(overIndex, 0, moved);
          setLocalPairs(newPairs);
          dragIndex.current = overIndex;
        }
        break;
      }
    }
  }, [dragging, localPairs]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (dragging !== null && localPairs) {
      reorderFavouritePairs(localPairs);
      onReorder?.();
    }
    setDragging(null);
    setLocalPairs(null);
    dragIndex.current = null;
  }, [dragging, localPairs, onReorder]);

  return (
    <div
      className="flex gap-2 overflow-x-auto no-scrollbar"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {displayPairs.map((pair, i) => {
        const isActive =
          pair.base === currentBase && pair.quote === currentQuote;
        const isDragged = dragging === i;
        return (
          <button
            key={`${pair.base}-${pair.quote}`}
            data-pair-index={i}
            onClick={() => {
              if (dragging !== null) return;
              onSelect(pair.base, pair.quote);
            }}
            onTouchStart={(e) => handleTouchStart(i, e)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border text-xs font-sans tracking-wider whitespace-nowrap transition-all duration-100 shrink-0 ${
              isDragged
                ? "bg-accent/20 border-accent/50 text-accent scale-105 shadow-lg"
                : isActive
                  ? "bg-accent/15 border-accent/40 text-accent"
                  : "bg-bg-surface border-border-subtle text-text-secondary active:bg-bg-raised"
            }`}
          >
            <CountryFlag currencyCode={pair.base} />
            <span>{pair.base}</span>
            <span className="text-text-muted">/</span>
            <CountryFlag currencyCode={pair.quote} />
            <span>{pair.quote}</span>
          </button>
        );
      })}
    </div>
  );
}
