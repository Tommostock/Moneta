import { describe, it, expect } from "vitest";
import { percentChange, findHighLow, rateContextText } from "../rates";
import type { TimeSeriesPoint } from "@/types";

describe("percentChange", () => {
  it("calculates positive change", () => {
    expect(percentChange(110, 100)).toBeCloseTo(10);
  });

  it("calculates negative change", () => {
    expect(percentChange(90, 100)).toBeCloseTo(-10);
  });

  it("returns 0 when values are equal", () => {
    expect(percentChange(100, 100)).toBe(0);
  });

  it("returns 0 when previous is 0 (division by zero guard)", () => {
    expect(percentChange(100, 0)).toBe(0);
  });

  it("handles small fractional changes", () => {
    expect(percentChange(1.19, 1.18)).toBeCloseTo(0.8475, 2);
  });
});

describe("findHighLow", () => {
  const data: TimeSeriesPoint[] = [
    { date: "2026-03-01", rate: 1.18 },
    { date: "2026-03-02", rate: 1.21 },
    { date: "2026-03-03", rate: 1.15 },
    { date: "2026-03-04", rate: 1.19 },
  ];

  it("finds the highest rate point", () => {
    const { high } = findHighLow(data);
    expect(high).toEqual({ date: "2026-03-02", rate: 1.21 });
  });

  it("finds the lowest rate point", () => {
    const { low } = findHighLow(data);
    expect(low).toEqual({ date: "2026-03-03", rate: 1.15 });
  });

  it("handles single-element array", () => {
    const single: TimeSeriesPoint[] = [{ date: "2026-03-01", rate: 1.0 }];
    const { high, low } = findHighLow(single);
    expect(high).toEqual(single[0]);
    expect(low).toEqual(single[0]);
  });

  it("handles equal values", () => {
    const equal: TimeSeriesPoint[] = [
      { date: "2026-03-01", rate: 1.0 },
      { date: "2026-03-02", rate: 1.0 },
    ];
    const { high, low } = findHighLow(equal);
    expect(high.rate).toBe(1.0);
    expect(low.rate).toBe(1.0);
  });
});

describe("rateContextText", () => {
  it("generates stronger text for positive change", () => {
    const text = rateContextText("GBP", "EUR", 1.19, 1.15, 30);
    expect(text).toBe("GBP is 3.5% stronger against EUR than 30 days ago");
  });

  it("generates weaker text for negative change", () => {
    const text = rateContextText("GBP", "EUR", 1.15, 1.19, 30);
    expect(text).toBe("GBP is 3.4% weaker against EUR than 30 days ago");
  });

  it("generates stronger text for zero change", () => {
    const text = rateContextText("GBP", "EUR", 1.19, 1.19, 7);
    expect(text).toBe("GBP is 0.0% stronger against EUR than 7 days ago");
  });
});
