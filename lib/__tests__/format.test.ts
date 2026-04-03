import { describe, it, expect } from "vitest";
import { formatAmount, formatRate, padDisplay, sanitizeNumericInput } from "../format";

describe("formatAmount", () => {
  it("formats integers with 2 decimal places", () => {
    expect(formatAmount(100)).toBe("100.00");
  });

  it("adds thousand separators", () => {
    const result = formatAmount(1234567.89);
    expect(result).toBe("1,234,567.89");
  });

  it("rounds to 2 decimal places", () => {
    expect(formatAmount(1.999)).toBe("2.00");
  });

  it("handles zero", () => {
    expect(formatAmount(0)).toBe("0.00");
  });

  it("handles small decimals", () => {
    expect(formatAmount(0.1)).toBe("0.10");
  });
});

describe("formatRate", () => {
  it("formats to 4 decimal places", () => {
    expect(formatRate(1.18)).toBe("1.1800");
  });

  it("truncates beyond 4 decimals", () => {
    expect(formatRate(0.84265)).toBe("0.8427");
  });

  it("handles zero", () => {
    expect(formatRate(0)).toBe("0.0000");
  });

  it("handles integers", () => {
    expect(formatRate(2)).toBe("2.0000");
  });
});

describe("padDisplay", () => {
  it("pads shorter strings with leading spaces", () => {
    expect(padDisplay("42", 6)).toBe("    42");
  });

  it("returns string as-is if already at target length", () => {
    expect(padDisplay("123456", 6)).toBe("123456");
  });

  it("does not truncate longer strings", () => {
    expect(padDisplay("1234567", 6)).toBe("1234567");
  });
});

describe("sanitizeNumericInput", () => {
  it("passes through valid numeric strings", () => {
    expect(sanitizeNumericInput("123.45")).toBe("123.45");
  });

  it("strips letters and special characters", () => {
    expect(sanitizeNumericInput("$1,234.56")).toBe("1234.56");
  });

  it("allows only one decimal point", () => {
    expect(sanitizeNumericInput("12.34.56")).toBe("12.3456");
  });

  it("handles empty string", () => {
    expect(sanitizeNumericInput("")).toBe("");
  });

  it("strips all non-numeric except first decimal", () => {
    expect(sanitizeNumericInput("abc")).toBe("");
  });

  it("handles leading decimal", () => {
    expect(sanitizeNumericInput(".5")).toBe(".5");
  });

  it("handles pasted currency values", () => {
    expect(sanitizeNumericInput("EUR 1,500.00")).toBe("1500.00");
  });
});
