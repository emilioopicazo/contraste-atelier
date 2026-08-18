import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isShopifyEnabled } from "@/lib/config";

const ENV_KEYS = [
  "SHOPIFY_ENABLED",
  "SHOPIFY_STORE_DOMAIN",
  "SHOPIFY_STOREFRONT_PRIVATE_TOKEN",
  "SHOPIFY_STOREFRONT_PUBLIC_TOKEN",
];

const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  ENV_KEYS.forEach((k) => {
    saved[k] = process.env[k];
    delete process.env[k];
  });
});

afterEach(() => {
  ENV_KEYS.forEach((k) => {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  });
  vi.restoreAllMocks();
});

function enableShopify() {
  process.env.SHOPIFY_ENABLED = "true";
  process.env.SHOPIFY_STORE_DOMAIN = "contraste-test.myshopify.com";
  process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN = "shppa_test_private";
}

describe("feature flag", () => {
  it("is disabled without env, with partial env, or when flag is false", () => {
    expect(isShopifyEnabled()).toBe(false);
    process.env.SHOPIFY_ENABLED = "true";
    expect(isShopifyEnabled()).toBe(false); // no domain/token
    process.env.SHOPIFY_STORE_DOMAIN = "x.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN = "t";
    process.env.SHOPIFY_ENABLED = "false";
    expect(isShopifyEnabled()).toBe(false);
  });

  it("activates only with flag + domain + token", () => {
    enableShopify();
    expect(isShopifyEnabled()).toBe(true);
  });
});

describe("shopifyFetch", () => {
  it("throws a typed 'disabled' error when commerce is off", async () => {
    const { shopifyFetch, ShopifyError } = await import("@/lib/commerce/shopify");
    await expect(shopifyFetch("query { shop { name } }")).rejects.toBeInstanceOf(ShopifyError);
    await expect(shopifyFetch("query { shop { name } }")).rejects.toMatchObject({
      code: "disabled",
    });
  });

  it("sends the private token server-side and parses data", async () => {
    enableShopify();
    const { shopifyFetch } = await import("@/lib/commerce/shopify");
    const fetchMock = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      expect(String(url)).toContain("contraste-test.myshopify.com/api/");
      const headers = init?.headers as Record<string, string>;
      expect(headers["Shopify-Storefront-Private-Token"]).toBe("shppa_test_private");
      return new Response(JSON.stringify({ data: { ok: true } }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const data = await shopifyFetch<{ ok: boolean }>("query { x }", { revalidate: false });
    expect(data.ok).toBe(true);
  });

  it("surfaces GraphQL userErrors as ShopifyError instead of pretending success", async () => {
    enableShopify();
    const { shopifyFetch, ShopifyError } = await import("@/lib/commerce/shopify");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ errors: [{ message: "Variant sold out" }] }), {
          status: 200,
        })
      )
    );
    await expect(shopifyFetch("mutation { x }", { revalidate: false })).rejects.toMatchObject({
      name: "ShopifyError",
      message: expect.stringContaining("Variant sold out"),
    });
    expect(ShopifyError).toBeDefined();
  });
});

describe("catalog mapping", () => {
  it("maps products, options, variants and contraste metafields", async () => {
    enableShopify();
    const { getProducts } = await import("@/lib/commerce/queries");
    const raw = {
      data: {
        products: {
          nodes: [
            {
              id: "gid://shopify/Product/1",
              handle: "test-ring",
              title: "Test Ring",
              description: "A ring.",
              descriptionHtml: "<p>A ring.</p>",
              availableForSale: true,
              totalInventory: 1,
              featuredImage: { url: "https://cdn.shopify.com/a.jpg", altText: null, width: 800, height: 800 },
              images: { nodes: [] },
              priceRange: {
                minVariantPrice: { amount: "2100.0", currencyCode: "MXN" },
                maxVariantPrice: { amount: "2100.0", currencyCode: "MXN" },
              },
              options: [{ name: "Size", optionValues: [{ name: "7" }, { name: "8" }] }],
              variants: {
                nodes: [
                  {
                    id: "gid://shopify/ProductVariant/11",
                    title: "7",
                    availableForSale: true,
                    quantityAvailable: 1,
                    sku: "CTR-R-7",
                    price: { amount: "2100.0", currencyCode: "MXN" },
                    selectedOptions: [{ name: "Size", value: "7" }],
                    image: null,
                  },
                ],
              },
              metafields: [
                { key: "material", value: "Brass" },
                { key: "production_mode", value: "one_of_one" },
                null,
              ],
            },
          ],
        },
      },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(raw), { status: 200 }))
    );
    const products = await getProducts(1);
    expect(products).toHaveLength(1);
    const p = products[0];
    expect(p.handle).toBe("test-ring");
    expect(p.options).toEqual([{ name: "Size", values: ["7", "8"] }]);
    expect(p.variants[0].sku).toBe("CTR-R-7");
    expect(p.metafields.material).toBe("Brass");
    expect(p.metafields.productionMode).toBe("one_of_one");
  });
});
