/* Workshop domain rules. Mirrors the SQL in supabase/migrations — the
   database enforces these atomically; this module exists for display
   logic, the month generator, validation and tests. */

export const WORKSHOP_TIMEZONE = "America/Cancun"; // UTC-5, no DST

export const WORKSHOP = {
  type: "wax_ring" as const,
  slug: "wax-ring",
  startHour: 17, // 5:00 PM
  endHour: 20, //  8:00 PM
  durationHours: 3,
  standardCapacity: 4,
  hardCapacity: 5,
  /* New public sessions: Monday (1) and Thursday (4). Tuesday/Friday are
     continuation days only — never public booking inventory. */
  publicWeekdays: [1, 4] as const,
};

export type Instructor = "adrian" | "emilio";
export const DEFAULT_INSTRUCTOR: Instructor = "adrian";
export const INSTRUCTOR_DISPLAY: Record<Instructor, string> = {
  adrian: "Adrián",
  emilio: "Emilio",
};

export type SessionStatus = "open" | "blocked" | "cancelled";
export type BookingStatus = "confirmed" | "cancelled" | "completed" | "no_show";
export type MetalPreference = "brass" | "silver_quote" | "gold_quote" | "undecided";

export const METAL_PREFERENCES: MetalPreference[] = [
  "brass",
  "silver_quote",
  "gold_quote",
  "undecided",
];

export interface PublicSession {
  id: string;
  starts_at: string; // ISO timestamptz
  ends_at: string;
  available_seats: number;
  effective_capacity: number;
}

/* ── Capacity ─────────────────────────────────────────────────────────── */

export function effectiveCapacity(opts: {
  standardCapacity: number;
  hardCapacity: number;
  extraSpotEnabled: boolean;
}): number {
  return opts.extraSpotEnabled ? opts.hardCapacity : opts.standardCapacity;
}

export function availableSeats(effective: number, confirmedSeats: number): number {
  return Math.max(0, effective - confirmedSeats);
}

export function canAcceptPartySize(available: number, partySize: number): boolean {
  return partySize >= 1 && partySize <= available;
}

/* ── Scarcity display — derived from real state only ─────────────────── */

export type SeatDisplayState =
  | { kind: "available"; seats: number }
  | { kind: "low"; seats: number }
  | { kind: "last" }
  | { kind: "sold_out" };

export function seatDisplayState(available: number): SeatDisplayState {
  if (available <= 0) return { kind: "sold_out" };
  if (available === 1) return { kind: "last" };
  if (available === 2) return { kind: "low", seats: 2 };
  return { kind: "available", seats: available };
}

/* Presence display: nothing below 2 real viewers. */
export function presenceLabelCount(viewers: number): number | null {
  return viewers >= 2 ? viewers : null;
}

/* ── Month generation (Mon + Thu, 17:00–20:00 America/Cancun) ────────── */

export interface GeneratedSession {
  date: string; // YYYY-MM-DD (public day, local)
  startsAtUtc: string;
  endsAtUtc: string;
  continuationDate: string; // next day
  continuationStartsAtUtc: string;
  continuationEndsAtUtc: string;
}

const CANCUN_UTC_OFFSET_HOURS = 5; // fixed; Quintana Roo has no DST

function cancunLocalToUtcIso(date: string, hour: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hour + CANCUN_UTC_OFFSET_HOURS)).toISOString();
}

function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function generateMonthlySessions(year: number, month: number): GeneratedSession[] {
  const out: GeneratedSession[] = [];
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const dt = new Date(Date.UTC(year, month - 1, day));
    const weekday = dt.getUTCDay();
    if (!(WORKSHOP.publicWeekdays as readonly number[]).includes(weekday)) continue;
    const date = dt.toISOString().slice(0, 10);
    const continuationDate = addDays(date, 1);
    out.push({
      date,
      startsAtUtc: cancunLocalToUtcIso(date, WORKSHOP.startHour),
      endsAtUtc: cancunLocalToUtcIso(date, WORKSHOP.endHour),
      continuationDate,
      continuationStartsAtUtc: cancunLocalToUtcIso(continuationDate, WORKSHOP.startHour),
      continuationEndsAtUtc: cancunLocalToUtcIso(continuationDate, WORKSHOP.endHour),
    });
  }
  return out;
}

/* Authorized September 2026 seed (spec §8). */
export const SEPTEMBER_2026_DATES = [
  "2026-09-03",
  "2026-09-07",
  "2026-09-10",
  "2026-09-14",
  "2026-09-17",
  "2026-09-21",
  "2026-09-24",
  "2026-09-28",
] as const;

/* ── Booking reference ────────────────────────────────────────────────── */

export const BOOKING_REFERENCE_PATTERN = /^CTR-WRK-\d{6}-[A-Z2-9]{4}$/;

/* ── Phone normalization toward E.164 ────────────────────────────────── */

export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/[^0-9]/g, "");
  if (!digits) return "";
  if (hasPlus) return `+${digits}`;
  // Mexican 10-digit local numbers default to +52.
  if (digits.length === 10) return `+52${digits}`;
  if (digits.length === 12 && digits.startsWith("52")) return `+${digits}`;
  if (digits.length === 13 && digits.startsWith("521")) {
    digits = `52${digits.slice(3)}`; // drop legacy mobile '1'
    return `+${digits}`;
  }
  return `+${digits}`;
}
