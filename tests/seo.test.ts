import { describe, expect, it } from "vitest";
import {
  buildLocalBusinessJsonLd,
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo/jsonld";
import { localePath } from "@/lib/i18n/locales";

describe("LocalBusiness JSON-LD", () => {
  const ld = buildLocalBusinessJsonLd() as Record<string, unknown>;

  it("carries the verified business facts", () => {
    expect(ld["@type"]).toBe("JewelryStore");
    expect(ld.name).toBe("Contraste Atelier");
    expect(ld.telephone).toBe("+525530374167");
    const addr = ld.address as Record<string, string>;
    expect(addr.streetAddress).toContain("Calle 12 Sur");
    expect(addr.postalCode).toBe("77760");
    expect(addr.addressCountry).toBe("MX");
  });

  it("never invents opening hours (reservation-based atelier)", () => {
    expect(ld).not.toHaveProperty("openingHours");
    expect(ld).not.toHaveProperty("openingHoursSpecification");
  });
});

describe("Product JSON-LD", () => {
  it("mirrors live availability and price", () => {
    const ld = buildProductJsonLd({
      name: "Ring",
      description: "d",
      url: "https://contraste-atelier.com/shop/ring",
      images: ["https://cdn.shopify.com/x.jpg"],
      price: "2100.0",
      currency: "MXN",
      availableForSale: false,
    }) as { offers: Record<string, string> };
    expect(ld.offers.availability).toBe("https://schema.org/OutOfStock");
    expect(ld.offers.price).toBe("2100.0");
    expect(ld.offers.priceCurrency).toBe("MXN");
  });
});

describe("breadcrumbs + locale paths", () => {
  it("numbers breadcrumb positions from 1", () => {
    const ld = buildBreadcrumbJsonLd([
      { name: "Home", url: "https://x.com" },
      { name: "Shop", url: "https://x.com/shop" },
    ]) as { itemListElement: { position: number }[] };
    expect(ld.itemListElement.map((i) => i.position)).toEqual([1, 2]);
  });

  it("keeps EN at the root and ES under /es", () => {
    expect(localePath("en", "/")).toBe("/");
    expect(localePath("es", "/")).toBe("/es");
    expect(localePath("en", "/shop/ring")).toBe("/shop/ring");
    expect(localePath("es", "/shop/ring")).toBe("/es/shop/ring");
  });
});
