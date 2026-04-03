"use client";

interface SegmentDisplayProps {
  value: string;
  size?: number; // font size in pixels
}

export default function SegmentDisplay({
  value,
  size = 28,
}: SegmentDisplayProps) {
  return (
    <span
      className="text-text-primary tabular-nums tracking-tight"
      style={{
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        fontSize: size,
        fontWeight: 500,
        lineHeight: 1.1,
      }}
    >
      {value}
    </span>
  );
}
