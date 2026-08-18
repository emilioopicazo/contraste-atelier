import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

/* Future-ready Shopify webhook endpoint (orders/create, orders/paid, …).
   Inactive until SHOPIFY_WEBHOOK_SECRET is configured; every request is
   HMAC-verified before any processing (spec §78). */

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const hmac = req.headers.get("x-shopify-hmac-sha256");
  if (!hmac) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const raw = await req.text();
  const digest = crypto.createHmac("sha256", secret).update(raw, "utf8").digest("base64");
  const valid =
    hmac.length === digest.length &&
    crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
  if (!valid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const topic = req.headers.get("x-shopify-topic") ?? "unknown";
  console.log("[shopify-webhook] received:", topic);
  // No workflow consumes these events yet — acknowledge and stop (spec §78).
  return NextResponse.json({ ok: true });
}
