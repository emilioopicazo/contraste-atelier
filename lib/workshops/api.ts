import "server-only";
import { supabaseAnonServer, supabaseService } from "@/lib/supabase/server";
import type { PublicSession, MetalPreference } from "./domain";

export async function fetchPublicSessions(): Promise<PublicSession[] | null> {
  const supabase = supabaseAnonServer();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("get_public_sessions");
  if (error) {
    console.error("[workshops] get_public_sessions failed:", error.code, error.message);
    return null;
  }
  return (data ?? []) as PublicSession[];
}

export interface CreateBookingInput {
  sessionId: string;
  name: string;
  email: string;
  phone: string;
  partySize: number;
  metalPreference: MetalPreference;
  notes?: string;
  idempotencyKey: string;
  source?: "website" | "admin";
  utm?: Record<string, string>;
}

export interface BookingRecord {
  id: string;
  booking_reference: string;
  session_id: string;
  starts_at: string;
  ends_at: string;
  party_size: number;
  metal_preference: MetalPreference;
  remaining_seats: number;
  duplicate: boolean;
}

export type CreateBookingResult =
  | { ok: true; booking: BookingRecord }
  | {
      ok: false;
      code: "sold_out" | "party_too_large" | "unavailable" | "not_configured" | "error";
      remaining?: number;
      nextAvailable?: PublicSession | null;
    };

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const supabase = supabaseService();
  if (!supabase) return { ok: false, code: "not_configured" };

  const { data, error } = await supabase.rpc("create_booking", {
    p_session_id: input.sessionId,
    p_customer_name: input.name,
    p_email: input.email,
    p_phone: input.phone,
    p_party_size: input.partySize,
    p_metal_preference: input.metalPreference,
    p_customer_notes: input.notes ?? null,
    p_idempotency_key: input.idempotencyKey,
    p_source: input.source ?? "website",
    p_utm: input.utm && Object.keys(input.utm).length ? input.utm : null,
  });

  if (error) {
    // Custom SQLSTATEs raised by the booking function (see migration 0001).
    if (error.code === "CA001") {
      const remaining = Number((error.message.match(/remaining=(\d+)/) || [])[1] ?? 0);
      return { ok: false, code: "party_too_large", remaining };
    }
    if (error.code === "CA002") {
      return { ok: false, code: "sold_out", nextAvailable: await nextAvailableSession() };
    }
    if (error.code === "CA003" || error.code === "CA004") {
      return { ok: false, code: "unavailable" };
    }
    console.error("[workshops] create_booking failed:", error.code, error.message);
    return { ok: false, code: "error" };
  }

  return { ok: true, booking: data as BookingRecord };
}

export async function nextAvailableSession(): Promise<PublicSession | null> {
  const sessions = await fetchPublicSessions();
  if (!sessions) return null;
  return sessions.find((s) => s.available_seats > 0) ?? null;
}
