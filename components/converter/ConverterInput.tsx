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

  const handleTap = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="flex items-center justify-end" onClick={handleTap}>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder="0"
        maxLength={16}
        className="w-full text-right text-text-primary tabular-nums tracking-tight font-sans bg-transparent border-none outline-none caret-accent placeholder:text-text-muted"
        style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.1 }}
        autoComplete="off"
      />
    </div>
  );
}
