import { describe, expect, it } from "vitest";
import {
  generateMonthlySessions,
  SEPTEMBER_2026_DATES,
} from "@/lib/workshops/domain";

describe("month generator (Mon + Thu, 17:00–20:00 America/Cancun)", () => {
  it("September 2026 matches the authorized seed exactly", () => {
    const dates = generateMonthlySessions(2026, 9).map((g) => g.date);
    expect(dates).toEqual([...SEPTEMBER_2026_DATES]);
  });

  it("generates only Mondays and Thursdays", () => {
    for (const g of generateMonthlySessions(2026, 10)) {
      const dow = new Date(`${g.date}T12:00:00Z`).getUTCDay();
      expect([1, 4]).toContain(dow);
    }
  });

  it("converts 17:00 Cancun to 22:00 UTC (fixed UTC-5, no DST)", () => {
    const first = generateMonthlySessions(2026, 9)[0];
    expect(first.date).toBe("2026-09-03");
    expect(first.startsAtUtc).toBe("2026-09-03T22:00:00.000Z");
    expect(first.endsAtUtc).toBe("2026-09-04T01:00:00.000Z");
  });

  it("continuation is always the following day", () => {
    for (const g of generateMonthlySessions(2026, 12)) {
      const pub = new Date(`${g.date}T00:00:00Z`).getTime();
      const cont = new Date(`${g.continuationDate}T00:00:00Z`).getTime();
      expect(cont - pub).toBe(86400_000);
    }
  });

  it("handles month boundaries (continuation crosses into next month)", () => {
    const sept = generateMonthlySessions(2026, 9);
    const lastMonday = sept[sept.length - 1];
    expect(lastMonday.date).toBe("2026-09-28");
    expect(lastMonday.continuationDate).toBe("2026-09-29");
    // A Thursday Oct 1 2026 must not appear in September's set.
    expect(sept.some((g) => g.date.startsWith("2026-10"))).toBe(false);
  });
});
