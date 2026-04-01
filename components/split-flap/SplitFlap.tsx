"use client";

import { useEffect, useRef, useState } from "react";

interface SplitFlapProps {
  char: string;
  delay?: number;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-[18px] h-[28px] text-base",
  md: "w-[22px] h-[36px] text-xl",
  lg: "w-[28px] h-[48px] text-3xl",
};

export default function SplitFlap({ char, delay = 0, size = "md" }: SplitFlapProps) {
  const [displayChar, setDisplayChar] = useState(char);
  const [prevChar, setPrevChar] = useState(char);
  const [flipping, setFlipping] = useState(false);
  const prevRef = useRef(char);

  useEffect(() => {
    if (char !== prevRef.current) {
      setPrevChar(prevRef.current);
      setFlipping(true);

      const flipTimer = setTimeout(() => {
        setDisplayChar(char);
      }, delay + 90); // halfway through animation

      const endTimer = setTimeout(() => {
        setFlipping(false);
        prevRef.current = char;
      }, delay + 180);

      return () => {
        clearTimeout(flipTimer);
        clearTimeout(endTimer);
      };
    }
  }, [char, delay]);

  const sizeClass = sizeClasses[size];

  return (
    <div
      className={`relative ${sizeClass} font-mono font-medium select-none`}
      style={{ perspective: "300px" }}
    >
      {/* Static top half — shows new character */}
      <div className="absolute inset-0 bottom-1/2 bg-flap-face overflow-hidden rounded-t-[2px]">
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center text-text-primary">
          <span className="translate-y-1/2">{displayChar}</span>
        </div>
      </div>

      {/* Static bottom half — shows new character */}
      <div className="absolute inset-0 top-1/2 bg-flap-face overflow-hidden rounded-b-[2px]">
        <div className="absolute top-0 left-0 right-0 flex items-start justify-center text-text-primary">
          <span className="-translate-y-1/2">{displayChar}</span>
        </div>
      </div>

      {/* Animated top flap — old character flipping down */}
      {flipping && (
        <div
          className="absolute inset-0 bottom-1/2 bg-flap-face overflow-hidden rounded-t-[2px] z-10"
          style={{
            transformOrigin: "bottom center",
            animation: `flipDown 180ms ease-out ${delay}ms forwards`,
            backfaceVisibility: "hidden",
          }}
        >
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center text-text-primary">
            <span className="translate-y-1/2">{prevChar}</span>
          </div>
        </div>
      )}

      {/* Animated bottom flap — new character flipping up */}
      {flipping && (
        <div
          className="absolute inset-0 top-1/2 bg-flap-face overflow-hidden rounded-b-[2px] z-10"
          style={{
            transformOrigin: "top center",
            animation: `flipUp 180ms ease-out ${delay + 90}ms forwards`,
            backfaceVisibility: "hidden",
          }}
        >
          <div className="absolute top-0 left-0 right-0 flex items-start justify-center text-text-primary">
            <span className="-translate-y-1/2">{displayChar}</span>
          </div>
        </div>
      )}

      {/* Split line — the thin gap between halves */}
      <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-flap-split z-20 -translate-y-px" />

      {/* Subtle shadow at the bottom of top half */}
      <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-flap-shadow/50 z-10 -translate-y-full" />
    </div>
  );
}
