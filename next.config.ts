import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : "";
const supabaseWs = supabaseOrigin ? supabaseOrigin.replace(/^https/, "wss") : "";
const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN
  ? `https://${process.env.SHOPIFY_STORE_DOMAIN}`
  : "";

/* CSP: strict enough to matter, permissive enough not to break checkout
   handoff, Supabase realtime, Google Fonts or GTM. Tightened per-service
   as credentials land (origins derive from env, not wildcards). */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  "font-src 'self' https://fonts.gstatic.com",
  `img-src 'self' data: blob: https://cdn.shopify.com https://www.googletagmanager.com https://www.google-analytics.com`,
  "media-src 'self'",
  `connect-src 'self' https://www.google-analytics.com ${supabaseOrigin} ${supabaseWs} ${shopifyDomain}`.replace(/\s+/g, " ").trim(),
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: csp },
];

/* Locale routing (replaces middleware).
   The Edge middleware crashed in production with `__dirname is not
   defined`, taking every page down with a 500. Next's redirects and
   rewrites do the same routing at the CDN layer: no function to invoke,
   nothing to crash.
     /            rewritten internally to /en
     /es/...      served by app/[lang] with lang=es
     /en/...      redirected to the unprefixed URL (no duplicate content)
   The rewrites are listed one per top-level route on purpose. A single
   catch-all with a negative lookahead works under `next start` but not
   on Vercel, which compiles these rules into its own router and does not
   honour the lookahead: it rewrote every path, including /en/... and
   the API, into a dead one and the whole site 404'd. Explicit sources
   have no such ambiguity; anything unlisted falls through to Next's
   own catch-all and renders the site's 404. */
const LOCALE_REWRITES = [
  { source: "/", destination: "/en" },
  { source: "/admin", destination: "/en/admin" },
  { source: "/admin/:path*", destination: "/en/admin/:path*" },
  { source: "/gallery", destination: "/en/gallery" },
  { source: "/shop", destination: "/en/shop" },
  { source: "/shop/:path*", destination: "/en/shop/:path*" },
  { source: "/visit", destination: "/en/visit" },
  { source: "/workshops", destination: "/en/workshops" },
  { source: "/workshops/:path*", destination: "/en/workshops/:path*" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }],
  },
  async redirects() {
    return [
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/:path*", permanent: true },
      // Admin is a single-locale surface.
      { source: "/es/admin", destination: "/admin", permanent: true },
      { source: "/es/admin/:path*", destination: "/admin/:path*", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: LOCALE_REWRITES,
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/uploads/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
