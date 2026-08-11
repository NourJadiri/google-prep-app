import { describe, it, expect } from "vitest";
import { todayStr, daysBetween } from "./dates.js";

describe("todayStr", () => {
  it("formats a local date as YYYY-MM-DD, zero-padded", () => {
    expect(todayStr(new Date(2026, 7, 1))).toBe("2026-08-01");
    expect(todayStr(new Date(2026, 0, 9))).toBe("2026-01-09");
    expect(todayStr(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("uses the local calendar day, not UTC", () => {
    // 23:30 local is still today wherever the test runs.
    const d = new Date(2026, 5, 15, 23, 30);
    expect(todayStr(d)).toBe("2026-06-15");
  });
});

describe("daysBetween", () => {
  it("counts one day across a month boundary", () => {
    expect(daysBetween("2026-07-31", "2026-08-01")).toBe(1);
    expect(daysBetween("2026-04-30", "2026-05-01")).toBe(1);
  });

  it("counts one day across a year boundary", () => {
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
  });

  it("handles February in common and leap years", () => {
    expect(daysBetween("2026-02-28", "2026-03-01")).toBe(1);
    expect(daysBetween("2024-02-28", "2024-02-29")).toBe(1);
    expect(daysBetween("2024-02-29", "2024-03-01")).toBe(1);
  });

  it("is zero for the same day and negative going backwards", () => {
    expect(daysBetween("2026-08-11", "2026-08-11")).toBe(0);
    expect(daysBetween("2026-08-01", "2026-07-31")).toBe(-1);
  });

  it("spans longer gaps", () => {
    expect(daysBetween("2026-07-31", "2026-08-07")).toBe(7);
    expect(daysBetween("2026-01-01", "2027-01-01")).toBe(365);
  });
});
