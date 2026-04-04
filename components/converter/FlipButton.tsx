"use client";

import { useState } from "react";
import { ArrowUpDown } from "lucide-react";

interface FlipButtonProps {
  onFlip: () => void;
}

export default function FlipButton({ onFlip }: FlipButtonProps) {
  const [rotation, setRotation] = useState(0);

  const handleClick = () => {
    setRotation((r) => r + 180);
    onFlip();
  };

  return (
    <button
      onClick={handleClick}
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
