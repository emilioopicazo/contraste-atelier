import "server-only";
import { supabaseService } from "@/lib/supabase/server";
import type { BookingStatus, Instructor, MetalPreference, SessionStatus } from "./domain";

export interface AdminBooking {
  id: string;
  booking_reference: string;
  customer_name: string;
  email: string;
  phone: string;
  party_size: number;
  metal_preference: MetalPreference;
  customer_notes: string | null;
  status: BookingStatus;
  source: "website" | "admin";
  created_at: string;
}

export interface AdminSession {
  id: string;
  starts_at: string;
  ends_at: string;
  continuation_starts_at: string | null;
  instructor: Instructor;
  status: SessionStatus;
  standard_capacity: number;
  hard_capacity: number;
  extra_spot_enabled: boolean;
  internal_notes: string | null;
  confirmed_seats: number;
  bookings: AdminBooking[];
}

/* Month window in America/Cancun (fixed UTC-5). */
function monthRangeUtc(year: number, month: number): { from: string; to: string } {
  const from = new Date(Date.UTC(year, month - 1, 1, 5)).toISOString();
  const to = new Date(Date.UTC(year, month, 1, 5)).toISOString();
  return { from, to };
}

export async function fetchAdminMonth(
  year: number,
  month: number
): Promise<AdminSession[] | null> {
  const supabase = supabaseService();
  if (!supabase) return null;
  const { from, to } = monthRangeUtc(year, month);
  const { data, error } = await supabase
    .from("workshop_sessions")
    .select(
      `id, starts_at, ends_at, continuation_starts_at, instructor, status,
       standard_capacity, hard_capacity, extra_spot_enabled, internal_notes,
       workshop_bookings ( id, booking_reference, customer_name, email, phone,
         party_size, metal_preference, customer_notes, status, source, created_at )`
    )
    .gte("starts_at", from)
    .lt("starts_at", to)
    .order("starts_at", { ascending: true });
  if (error) {
    console.error("[admin] month fetch failed:", error.message);
    return null;
  }
  return (data ?? []).map((row) => {
    const bookings = (row.workshop_bookings ?? []) as AdminBooking[];
    return {
      id: row.id,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      continuation_starts_at: row.continuation_starts_at,
      instructor: row.instructor as Instructor,
      status: row.status as SessionStatus,
      standard_capacity: row.standard_capacity,
      hard_capacity: row.hard_capacity,
      extra_spot_enabled: row.extra_spot_enabled,
      internal_notes: row.internal_notes,
      confirmed_seats: bookings
        .filter((b) => b.status === "confirmed")
        .reduce((s, b) => s + b.party_size, 0),
      bookings: bookings.sort((a, b) => a.created_at.localeCompare(b.created_at)),
    };
  });
}
