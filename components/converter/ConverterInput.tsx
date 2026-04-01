"use client";

import { useCallback, useRef } from "react";
import { sanitizeNumericInput } from "@/lib/format";

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

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={value}
      onChange={handleChange}
      onPaste={handlePaste}
      placeholder="0.00"
      className="w-full text-right font-mono text-2xl text-text-primary bg-transparent outline-none placeholder:text-text-muted"
      style={{ fontSize: "24px" }}
      autoComplete="off"
    />
  );
}
