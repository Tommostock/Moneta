"use client";

import SplitFlap from "./SplitFlap";

interface SplitFlapGroupProps {
  value: string;
  size?: "sm" | "md" | "lg";
  staggerMs?: number;
}

export default function SplitFlapGroup({
  value,
  size = "md",
  staggerMs = 50,
}: SplitFlapGroupProps) {
  const chars = value.split("");

  return (
    <div className="flex gap-[2px]">
      {chars.map((char, i) => (
        <SplitFlap
          key={i}
          char={char}
          delay={i * staggerMs}
          size={size}
        />
      ))}
    </div>
  );
}
