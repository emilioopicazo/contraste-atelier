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
   defined`, taking every page down with a 500. Next's own redirects and
   rewrites do the same routing at the CDN layer: no function to invoke,
   nothing to crash.
     /            rewritten internally to /en
     /es/...      served by app/[lang] with lang=es
     /en/...      redirected to the unprefixed URL (no duplicate content)
   /api, /auth, static assets and any path with a file extension are
   excluded from the rewrite so they resolve as themselves. */
const LOCALE_REWRITE_SOURCE =
  "/:path((?!en$|en/|es$|es/|api/|auth/|_next/|assets/|uploads/)(?!.*\\.).*)";

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
      beforeFiles: [
        { source: "/", destination: "/en" },
        { source: LOCALE_REWRITE_SOURCE, destination: "/en/:path" },
      ],
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
