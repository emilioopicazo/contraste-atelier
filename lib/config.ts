/* Single source of truth for business constants and feature flags.
   No availability, prices or credentials are ever hardcoded here beyond
   what the owner has verified on the live site. */

export const SITE_NAME = "Contraste Atelier";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://contraste-atelier.com"
).replace(/\/$/, "");

export const CONTACT = {
  whatsappNumber: "525530374167", // verified by owner
  instagramHandle: "contraste_atelier",
  instagramUrl: "https://www.instagram.com/contraste_atelier/",
  mapsUrl: "https://maps.app.goo.gl/UMZeB4Zrcc9kuc2W8", // verified by owner
  address: {
    street: "Calle 12 Sur",
    neighborhood: "La Veleta",
    postalCode: "77760",
    city: "Tulum",
    region: "Q.R.",
    country: "México",
    countryCode: "MX",
  },
} as const;

export function whatsappLink(message: string): string {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/* ── Feature flags (env-driven, no code edits to flip) ────────────────── */

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function isShopifyEnabled(): boolean {
  return (
    process.env.SHOPIFY_ENABLED === "true" &&
    Boolean(process.env.SHOPIFY_STORE_DOMAIN) &&
    Boolean(
      process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN ||
        process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN
    )
  );
}

/* Workshop price: configured, never guessed. Returns null when unset. */
export function workshopPriceMXN(): number | null {
  const raw = process.env.NEXT_PUBLIC_WORKSHOP_PRICE_MXN;
  if (!raw) return null;
  const n = Number(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function formatMXN(amount: number): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })} MXN`;
}
