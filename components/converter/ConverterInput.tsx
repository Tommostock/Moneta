"use client";

import { useCallback, useRef } from "react";
import { sanitizeNumericInput } from "@/lib/format";
import SegmentDisplay from "@/components/display/SegmentDisplay";

interface ConverterInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ConverterInput({ value, onChange }: ConverterInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizeNumericInput(e.target.value);
      onChange(sanitized);
    },
    [onChange]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text");
      const sanitized = sanitizeNumericInput(text);
      onChange(sanitized);
    },
    [onChange]
  );

  const handleTap = () => {
    inputRef.current?.focus();
  };

  const displayValue = value || "0";

  return (
    <div className="relative flex items-center justify-end" onClick={handleTap}>
      {/* Hidden input for keyboard */}
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder="0"
        maxLength={16}
        className="absolute inset-0 w-full h-full opacity-0 cursor-text"
        style={{ fontSize: "16px" }}
        autoComplete="off"
      />
      {/* Visible segment display */}
      <SegmentDisplay value={displayValue} size={28} />
    </div>
  );
}
