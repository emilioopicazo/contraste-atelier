"use client";

/* Analytics abstraction. Events flow to the GTM dataLayer (and gtag when a
   GA4 id exists). Without configured IDs every call is a safe no-op.
   PII (names, emails, phones, notes) must NEVER pass through here. */

export type AnalyticsEvent =
  // website
  | "hero_workshop_click"
  | "hero_shop_click"
  | "instagram_click"
  | "maps_click"
  | "whatsapp_click"
  // workshop funnel
  | "workshop_view"
  | "workshop_session_select"
  | "workshop_booking_start"
  | "workshop_booking_submit"
  | "workshop_booking_success"
  | "workshop_booking_error"
  | "workshop_last_spot_view"
  | "workshop_sold_out_view"
  | "workshop_metal_interest"
  // GA4 ecommerce
  | "view_item_list"
  | "select_item"
  | "view_item"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "begin_checkout";

type Params = Record<string, string | number | boolean | undefined | object>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const PII_KEYS = new Set(["name", "email", "phone", "notes", "customer", "customer_name"]);

export function track(event: AnalyticsEvent, params: Params = {}): void {
  if (typeof window === "undefined") return;
  const clean: Params = {};
  for (const [k, v] of Object.entries(params)) {
    if (PII_KEYS.has(k.toLowerCase())) continue;
    clean[k] = v;
  }
  try {
    window.dataLayer?.push({ event, ...clean });
    window.gtag?.("event", event, clean);
  } catch {
    // analytics must never break the experience
  }
}
