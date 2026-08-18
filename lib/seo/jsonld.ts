import { CONTACT, SITE_NAME, SITE_URL } from "@/lib/config";

/* JSON-LD builders. Values must always match visible page/business state —
   nothing invented (no fake opening hours, no stale prices). */

export function buildLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: SITE_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/assets/og.jpg`,
    logo: `${SITE_URL}/assets/star-black.png`,
    telephone: `+${CONTACT.whatsappNumber}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${CONTACT.address.street}, ${CONTACT.address.neighborhood}`,
      addressLocality: CONTACT.address.city,
      addressRegion: CONTACT.address.region,
      postalCode: CONTACT.address.postalCode,
      addressCountry: CONTACT.address.countryCode,
    },
    hasMap: CONTACT.mapsUrl,
    sameAs: [CONTACT.instagramUrl],
    // Reservation-based atelier: no generic public opening hours (spec §61).
  };
}

export interface ProductJsonLdInput {
  name: string;
  description: string;
  url: string;
  images: string[];
  sku?: string;
  price: string; // decimal string from Shopify MoneyV2
  currency: string;
  availableForSale: boolean;
}

export function buildProductJsonLd(p: ProductJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.images,
    url: p.url,
    ...(p.sku ? { sku: p.sku } : {}),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: p.url,
      priceCurrency: p.currency,
      price: p.price,
      availability: p.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
