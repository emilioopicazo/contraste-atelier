import type { MetadataRoute } from "next";
import { SITE_URL, isShopifyEnabled } from "@/lib/config";
import { getProductHandles } from "@/lib/commerce";
import { localePath, LOCALES } from "@/lib/i18n/locales";

export const revalidate = 3600;

function entry(path: string, priority: number): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: `${SITE_URL}${localePath(locale, path)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority,
    alternates: {
      languages: {
        en: `${SITE_URL}${localePath("en", path)}`,
        es: `${SITE_URL}${localePath("es", path)}`,
      },
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    ...entry("/", 1),
    ...entry("/workshops/wax-ring", 0.9),
    ...entry("/gallery", 0.5),
    ...entry("/visit", 0.6),
  ];

  if (isShopifyEnabled()) {
    entries.push(...entry("/shop", 0.8));
    const handles = await getProductHandles();
    for (const handle of handles) {
      entries.push(...entry(`/shop/${handle}`, 0.7));
    }
  }

  return entries;
}
