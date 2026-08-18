import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { localePath, type Locale } from "@/lib/i18n/locales";

export function buildCanonical(locale: Locale, path: string): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}

export function buildAlternates(path: string): Metadata["alternates"] {
  return {
    canonical: undefined, // set per-locale in pageMetadata
    languages: {
      en: `${SITE_URL}${localePath("en", path)}`,
      es: `${SITE_URL}${localePath("es", path)}`,
      "x-default": `${SITE_URL}${localePath("en", path)}`,
    },
  };
}

export function pageMetadata(opts: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string;
  ogType?: "website" | "article";
  noindex?: boolean;
}): Metadata {
  const canonical = buildCanonical(opts.locale, opts.path);
  const image = opts.image ?? `${SITE_URL}/assets/og.jpg`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}${localePath("en", opts.path)}`,
        es: `${SITE_URL}${localePath("es", opts.path)}`,
        "x-default": `${SITE_URL}${localePath("en", opts.path)}`,
      },
    },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630 }],
      locale: opts.locale === "es" ? "es_MX" : "en_US",
      type: opts.ogType ?? "website",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
  };
}
