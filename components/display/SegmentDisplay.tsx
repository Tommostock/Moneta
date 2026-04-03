"use client";

import SegmentDigit from "./SegmentDigit";

interface SegmentDisplayProps {
  value: string;
  size?: number; // height per digit in pixels
}

export default function SegmentDisplay({
  value,
  size = 32,
}: SegmentDisplayProps) {
  const chars = value.split("");

  return (
    <div className="flex items-end gap-px">
      {chars.map((char, i) => (
        <SegmentDigit key={i} char={char} size={size} />
      ))}
    </div>
  );
}
