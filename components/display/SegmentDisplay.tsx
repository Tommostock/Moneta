"use client";

import { useEffect, useRef, useState } from "react";

interface SegmentDisplayProps {
  value: string;
  size?: number;
  flash?: boolean;
}

export default function SegmentDisplay({
  value,
  size = 28,
  flash = false,
}: SegmentDisplayProps) {
  const [flashing, setFlashing] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (!flash) return;
    if (value !== prevValue.current) {
      prevValue.current = value;
      setFlashing(true);
      const timer = setTimeout(() => setFlashing(false), 600);
      return () => clearTimeout(timer);
    }
  }, [value, flash]);

  return (
    <span
      className={`text-text-primary tabular-nums tracking-tight font-sans ${flashing ? "animate-number-flash" : ""}`}
      style={{
        fontSize: size,
        fontWeight: 500,
        lineHeight: 1.1,
      }}
    >
      {value}
    </span>
  );
}
