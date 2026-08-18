import "server-only";
import crypto from "node:crypto";
import { CONTACT, SITE_URL, whatsappLink } from "@/lib/config";
import { INSTRUCTOR_DISPLAY, WORKSHOP_TIMEZONE, type Instructor, type MetalPreference } from "@/lib/workshops/domain";
import { sessionDayLabel, sessionTimeRange, sessionDateISO } from "@/lib/workshops/format";

/* Notification layer. A failure here must NEVER roll back a confirmed
   booking — callers fire-and-record. Email uses a Resend-compatible HTTP
   API behind an abstraction; without credentials it reports "skipped". */

export interface BookingNotification {
  bookingReference: string;
  sessionStartsAt: string;
  sessionEndsAt: string;
  instructor: Instructor;
  customerName: string;
  email: string;
  phone: string;
  partySize: number;
  metalPreference: MetalPreference;
  notes?: string;
  remainingSeats: number;
}

const METAL_LABEL: Record<MetalPreference, string> = {
  brass: "Brass (included)",
  silver_quote: "Silver (separate quote)",
  gold_quote: "Gold (separate quote)",
  undecided: "Not decided yet",
};

export type EmailStatus = "sent" | "failed" | "skipped";

export async function sendBookingConfirmationEmail(
  b: BookingNotification
): Promise<EmailStatus> {
  const apiKey = process.env.TRANSACTIONAL_EMAIL_API_KEY;
  const from = process.env.BOOKING_FROM_EMAIL;
  if (!apiKey || !from) return "skipped";

  const day = sessionDayLabel(b.sessionStartsAt, "en");
  const time = sessionTimeRange(b.sessionStartsAt, b.sessionEndsAt, "en");
  const address = `${CONTACT.address.street}, ${CONTACT.address.neighborhood}, ${CONTACT.address.postalCode} ${CONTACT.address.city}, ${CONTACT.address.region}, ${CONTACT.address.country}`;

  const text = [
    `Your session is booked — Wax Ring Workshop`,
    ``,
    `Reference: ${b.bookingReference}`,
    `Date: ${day}`,
    `Time: ${time} (${WORKSHOP_TIMEZONE})`,
    `Participants: ${b.partySize}`,
    `Final metal: ${METAL_LABEL[b.metalPreference]}`,
    ``,
    `CONTRASTE Atelier`,
    address,
    `Directions: ${CONTACT.mapsUrl}`,
    ``,
    `Standard casting in brass is included. Silver and gold are quoted separately based on your finished design.`,
    `Some pieces may require a second studio session the following day — we'll coordinate it with you if needed.`,
    ``,
    `Questions? WhatsApp: ${whatsappLink("Hi! About my reservation " + b.bookingReference)}`,
    ``,
    SITE_URL,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [b.email],
        subject: `Booked — Wax Ring Workshop · ${day} · ${b.bookingReference}`,
        text,
      }),
    });
    if (!res.ok) {
      console.error("[email] provider returned", res.status);
      return "failed";
    }
    const internal = process.env.BOOKING_INTERNAL_EMAIL;
    if (internal) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [internal],
          subject: `New booking · ${b.bookingReference} · ${b.partySize}p · ${sessionDateISO(b.sessionStartsAt)}`,
          text: `${b.customerName}\n${b.phone}\n${b.email}\nParty: ${b.partySize}\nMetal: ${METAL_LABEL[b.metalPreference]}\nNotes: ${b.notes || "—"}\nRemaining seats: ${b.remainingSeats}`,
        }),
      }).catch(() => {});
    }
    return "sent";
  } catch (err) {
    console.error("[email] send failed:", err instanceof Error ? err.message : err);
    return "failed";
  }
}

/* Structured internal event → BOOKING_WEBHOOK_URL, HMAC-signed. */
export async function emitBookingEvent(
  event: "workshop.booking.created" | "workshop.booking.cancelled" | "workshop.booking.rescheduled",
  b: BookingNotification
): Promise<void> {
  const url = process.env.BOOKING_WEBHOOK_URL;
  if (!url) return;
  const payload = JSON.stringify({
    event,
    booking_reference: b.bookingReference,
    session: {
      date: sessionDateISO(b.sessionStartsAt),
      start: "17:00",
      end: "20:00",
      timezone: WORKSHOP_TIMEZONE,
      instructor: INSTRUCTOR_DISPLAY[b.instructor] ? b.instructor : b.instructor,
    },
    customer: { name: b.customerName, email: b.email, phone: b.phone },
    party_size: b.partySize,
    metal_preference: b.metalPreference,
    remaining_seats: b.remainingSeats,
  });
  const secret = process.env.BOOKING_WEBHOOK_SECRET;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (secret) {
    headers["x-contraste-signature"] = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
  }
  try {
    await fetch(url, { method: "POST", headers, body: payload });
  } catch (err) {
    console.error("[webhook] emit failed:", err instanceof Error ? err.message : err);
  }
}
