"use client";

import { ArrowUpDown } from "lucide-react";

interface FlipButtonProps {
  onFlip: () => void;
}

export default function FlipButton({ onFlip }: FlipButtonProps) {
  return (
    <button
      onClick={onFlip}
      className="flex items-center justify-center w-9 h-9 rounded-[4px] bg-bg-raised border border-border-subtle text-text-secondary active:bg-bg-surface active:text-accent transition-colors duration-100"
      aria-label="Swap currencies"
    >
      <ArrowUpDown size={16} />
    </button>
  );
}
