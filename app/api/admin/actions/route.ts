import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser, supabaseService } from "@/lib/supabase/server";
import { METAL_PREFERENCES, normalizePhone } from "@/lib/workshops/domain";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("set_status"),
    sessionId: z.string().uuid(),
    status: z.enum(["open", "blocked"]),
  }),
  z.object({
    action: z.literal("set_instructor"),
    sessionId: z.string().uuid(),
    instructor: z.enum(["adrian", "emilio"]),
  }),
  z.object({
    action: z.literal("set_extra_spot"),
    sessionId: z.string().uuid(),
    enabled: z.boolean(),
  }),
  z.object({
    action: z.literal("cancel_booking"),
    bookingId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("move_booking"),
    bookingId: z.string().uuid(),
    targetSessionId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("manual_booking"),
    sessionId: z.string().uuid(),
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().min(8).max(30),
    partySize: z.number().int().min(1).max(5),
    metalPreference: z.enum(METAL_PREFERENCES as [string, ...string[]]).default("undecided"),
    notes: z.string().trim().max(1000).optional(),
    idempotencyKey: z.string().min(8).max(80),
  }),
  z.object({
    action: z.literal("generate_month"),
    year: z.number().int().min(2024).max(2100),
    month: z.number().int().min(1).max(12),
  }),
]);

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!rateLimit(`admin:${admin.email}`, 60, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const supabase = supabaseService();
  if (!supabase) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  let input: z.infer<typeof actionSchema>;
  try {
    input = actionSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    switch (input.action) {
      case "set_status": {
        const { error } = await supabase
          .from("workshop_sessions")
          .update({ status: input.status })
          .eq("id", input.sessionId);
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }
      case "set_instructor": {
        const { error } = await supabase
          .from("workshop_sessions")
          .update({ instructor: input.instructor })
          .eq("id", input.sessionId);
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }
      case "set_extra_spot": {
        const { error } = await supabase.rpc("set_extra_spot", {
          p_session_id: input.sessionId,
          p_enabled: input.enabled,
        });
        if (error) {
          if (error.code === "CA006") {
            return NextResponse.json({ error: "five_confirmed" }, { status: 409 });
          }
          throw error;
        }
        return NextResponse.json({ ok: true });
      }
      case "cancel_booking": {
        const { error } = await supabase.rpc("cancel_booking", {
          p_booking_id: input.bookingId,
        });
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }
      case "move_booking": {
        const { error } = await supabase.rpc("move_booking", {
          p_booking_id: input.bookingId,
          p_target_session_id: input.targetSessionId,
        });
        if (error) {
          if (error.code === "CA001") {
            return NextResponse.json({ error: "target_full" }, { status: 409 });
          }
          if (error.code === "CA003" || error.code === "CA004") {
            return NextResponse.json({ error: "target_unavailable" }, { status: 409 });
          }
          throw error;
        }
        return NextResponse.json({ ok: true });
      }
      case "manual_booking": {
        const { data, error } = await supabase.rpc("create_booking", {
          p_session_id: input.sessionId,
          p_customer_name: input.name,
          p_email: input.email,
          p_phone: normalizePhone(input.phone),
          p_party_size: input.partySize,
          p_metal_preference: input.metalPreference,
          p_customer_notes: input.notes ?? null,
          p_idempotency_key: input.idempotencyKey,
          p_source: "admin",
          p_utm: null,
        });
        if (error) {
          if (error.code === "CA001") {
            const remaining = Number((error.message.match(/remaining=(\d+)/) || [])[1] ?? 0);
            return NextResponse.json({ error: "party_too_large", remaining }, { status: 409 });
          }
          if (error.code === "CA002") {
            return NextResponse.json({ error: "sold_out" }, { status: 409 });
          }
          if (error.code === "CA003" || error.code === "CA004") {
            return NextResponse.json({ error: "unavailable" }, { status: 409 });
          }
          throw error;
        }
        return NextResponse.json({ ok: true, booking: data });
      }
      case "generate_month": {
        const { data, error } = await supabase.rpc("generate_month", {
          p_year: input.year,
          p_month: input.month,
        });
        if (error) throw error;
        return NextResponse.json({ ok: true, result: data });
      }
    }
  } catch (err) {
    console.error("[admin] action failed:", input.action, err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
