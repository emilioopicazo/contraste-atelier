import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createBooking } from "@/lib/workshops/api";
import { normalizePhone, METAL_PREFERENCES, DEFAULT_INSTRUCTOR } from "@/lib/workshops/domain";
import { rateLimit } from "@/lib/rate-limit";
import { supabaseService } from "@/lib/supabase/server";
import {
  sendBookingConfirmationEmail,
  emitBookingEvent,
  type BookingNotification,
} from "@/lib/notifications";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  sessionId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(8).max(30),
  partySize: z.number().int().min(1).max(5),
  metalPreference: z.enum(METAL_PREFERENCES as [string, ...string[]]),
  notes: z.string().trim().max(1000).optional(),
  idempotencyKey: z.string().min(8).max(80),
  website: z.string().optional(), // honeypot — must be empty
  utm: z.record(z.string(), z.string().max(220)).optional(),
});

export async function POST(req: NextRequest) {
  // Rightmost x-forwarded-for entry: appended by the nearest trusted proxy,
  // so a client-supplied prefix can't rotate the limiter bucket.
  const fwd = req.headers.get("x-forwarded-for");
  const ip =
    (fwd && fwd.split(",").map((s) => s.trim()).filter(Boolean).pop()) ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!rateLimit(`bookings:${ip}`, 8, 60_000)) {
    return NextResponse.json({ ok: false, code: "error" }, { status: 429 });
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
  }

  // Honeypot: silently accept without creating anything.
  if (parsed.website) {
    return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
  }

  const utm = parsed.utm
    ? Object.fromEntries(Object.entries(parsed.utm).slice(0, 8))
    : undefined;

  const result = await createBooking({
    sessionId: parsed.sessionId,
    name: parsed.name,
    email: parsed.email,
    phone: normalizePhone(parsed.phone),
    partySize: parsed.partySize,
    metalPreference: parsed.metalPreference as (typeof METAL_PREFERENCES)[number],
    notes: parsed.notes,
    idempotencyKey: parsed.idempotencyKey,
    source: "website",
    utm,
  });

  if (!result.ok) {
    const status =
      result.code === "not_configured" ? 503 : result.code === "error" ? 500 : 409;
    return NextResponse.json(
      {
        ok: false,
        code: result.code === "not_configured" ? "error" : result.code,
        remaining: result.remaining,
        nextAvailable: result.nextAvailable ?? null,
      },
      { status }
    );
  }

  const booking = result.booking;

  // Notifications: fire-and-record, never rolls back the booking.
  if (!booking.duplicate) {
    const notif: BookingNotification = {
      bookingReference: booking.booking_reference,
      sessionStartsAt: booking.starts_at,
      sessionEndsAt: booking.ends_at,
      instructor: DEFAULT_INSTRUCTOR,
      customerName: parsed.name,
      email: parsed.email,
      phone: normalizePhone(parsed.phone),
      partySize: booking.party_size,
      metalPreference: booking.metal_preference,
      notes: parsed.notes,
      remainingSeats: booking.remaining_seats,
    };
    const emailStatus = await sendBookingConfirmationEmail(notif).catch(() => "failed" as const);
    const supabase = supabaseService();
    if (supabase) {
      await supabase
        .from("workshop_bookings")
        .update({
          confirmation_email_status: emailStatus,
          confirmation_email_sent_at: emailStatus === "sent" ? new Date().toISOString() : null,
        })
        .eq("id", booking.id);
    }
    emitBookingEvent("workshop.booking.created", notif).catch(() => {});
  }

  return NextResponse.json({
    ok: true,
    booking: {
      booking_reference: booking.booking_reference,
      starts_at: booking.starts_at,
      ends_at: booking.ends_at,
      party_size: booking.party_size,
      metal_preference: booking.metal_preference,
    },
  });
}
