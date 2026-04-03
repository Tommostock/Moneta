import { describe, it, expect, vi, afterEach } from "vitest";
import { formatDate, formatTime, daysAgoDate, todayDate } from "../dates";

afterEach(() => {
  vi.useRealTimers();
});

describe("formatDate", () => {
  it("formats a date string as 'day month'", () => {
    const result = formatDate("2026-04-01");
    expect(result).toBe("1 Apr");
  });

  it("formats another date correctly", () => {
    const result = formatDate("2026-12-25");
    expect(result).toBe("25 Dec");
  });
});

describe("formatTime", () => {
  it("formats a Date as HH:MM", () => {
    const date = new Date("2026-04-01T14:30:00");
    const result = formatTime(date);
    expect(result).toBe("14:30");
  });

  it("zero-pads hours and minutes", () => {
    const date = new Date("2026-04-01T09:05:00");
    const result = formatTime(date);
    expect(result).toBe("09:05");
  });
});

describe("daysAgoDate", () => {
  it("returns today's date for 0 days ago", () => {
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
    expect(daysAgoDate(0)).toBe("2026-04-03");
  });

  it("returns correct date for 30 days ago", () => {
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
    expect(daysAgoDate(30)).toBe("2026-03-04");
  });

  it("handles crossing year boundaries", () => {
    vi.setSystemTime(new Date("2026-01-15T12:00:00Z"));
    expect(daysAgoDate(30)).toBe("2025-12-16");
  });
});

describe("todayDate", () => {
  it("returns today in YYYY-MM-DD format", () => {
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
    expect(todayDate()).toBe("2026-04-03");
  });
});
