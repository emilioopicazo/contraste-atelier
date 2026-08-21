import { describe, expect, it } from "vitest";
import {
  availableSeats,
  BOOKING_REFERENCE_PATTERN,
  canAcceptPartySize,
  effectiveCapacity,
  normalizePhone,
  presenceLabelCount,
  seatDisplayState,
} from "@/lib/workshops/domain";

describe("capacity model", () => {
  const base = { standardCapacity: 4, hardCapacity: 5 };

  it("effective capacity is 4 with the fifth seat closed", () => {
    expect(effectiveCapacity({ ...base, extraSpotEnabled: false })).toBe(4);
  });

  it("effective capacity is 5 only when the fifth seat is manually opened", () => {
    expect(effectiveCapacity({ ...base, extraSpotEnabled: true })).toBe(5);
  });

  it("available seats derive from confirmed seats and clamp at zero", () => {
    expect(availableSeats(4, 0)).toBe(4);
    expect(availableSeats(4, 3)).toBe(1);
    expect(availableSeats(4, 4)).toBe(0);
    expect(availableSeats(4, 9)).toBe(0);
  });

  it("party size must fit the remaining seats", () => {
    expect(canAcceptPartySize(2, 2)).toBe(true);
    expect(canAcceptPartySize(2, 3)).toBe(false);
    expect(canAcceptPartySize(0, 1)).toBe(false);
    expect(canAcceptPartySize(4, 0)).toBe(false);
  });
});

describe("scarcity display — real state only", () => {
  it("maps seat counts to the spec's states", () => {
    expect(seatDisplayState(4)).toEqual({ kind: "available", seats: 4 });
    expect(seatDisplayState(3)).toEqual({ kind: "available", seats: 3 });
    expect(seatDisplayState(2)).toEqual({ kind: "low", seats: 2 });
    expect(seatDisplayState(1)).toEqual({ kind: "last" });
    expect(seatDisplayState(0)).toEqual({ kind: "sold_out" });
  });

  it("presence shows nothing below two real viewers", () => {
    expect(presenceLabelCount(0)).toBeNull();
    expect(presenceLabelCount(1)).toBeNull();
    expect(presenceLabelCount(2)).toBe(2);
    expect(presenceLabelCount(7)).toBe(7);
  });
});

describe("phone normalization toward E.164", () => {
  it("keeps international numbers", () => {
    expect(normalizePhone("+52 55 3037 4167")).toBe("+525530374167");
    expect(normalizePhone("+1 (415) 555-0000")).toBe("+14155550000");
  });
  it("assumes +52 for bare 10-digit numbers", () => {
    expect(normalizePhone("55 3037 4167")).toBe("+525530374167");
  });
  it("drops the legacy mobile 1 from 521-prefixed numbers", () => {
    expect(normalizePhone("5215530374167")).toBe("+525530374167");
  });
  it("returns empty for garbage", () => {
    expect(normalizePhone("---")).toBe("");
  });
});

describe("booking reference format", () => {
  it("accepts the canonical shape and rejects ambiguity", () => {
    expect(BOOKING_REFERENCE_PATTERN.test("CTR-WRK-260914-A7K3")).toBe(true);
    expect(BOOKING_REFERENCE_PATTERN.test("CTR-WRK-260914-A7K")).toBe(false);
    expect(BOOKING_REFERENCE_PATTERN.test("CTR-WRK-260914-A7K0")).toBe(false); // 0 excluded
    expect(BOOKING_REFERENCE_PATTERN.test("XXX-WRK-260914-A7K3")).toBe(false);
  });
});
