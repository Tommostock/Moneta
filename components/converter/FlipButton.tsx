"use client";

import { ArrowUpDown } from "lucide-react";

interface FlipButtonProps {
  onFlip: () => void;
  rotation?: number;
}

export default function FlipButton({ onFlip, rotation = 0 }: FlipButtonProps) {
  return (
    <button
      onClick={onFlip}
      className="flex items-center justify-center w-9 h-9 rounded-[4px] bg-bg-raised border border-border-subtle text-text-secondary active:text-accent haptic-tap transition-colors duration-100"
      aria-label="Swap currencies"
    >
      <div
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 300ms ease-out",
        }}
      >
        <ArrowUpDown size={16} />
      </div>
    </button>
  );
}
