import "server-only";
import { isShopifyEnabled } from "@/lib/config";

/* Shopify Storefront API client — dedicated CONTRASTE store only.
   Tokens live server-side exclusively; components never see GraphQL. */

const API_VERSION = process.env.SHOPIFY_STOREFRONT_API_VERSION || "2025-07";

export class ShopifyError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "disabled"
      | "http_error"
      | "graphql_error"
      | "network_error" = "graphql_error"
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

interface ShopifyFetchOptions {
  variables?: Record<string, unknown>;
  /* Catalog reads cache briefly; cart/checkout must always be fresh. */
  revalidate?: number | false;
  tags?: string[];
}

export async function shopifyFetch<T>(
  query: string,
  { variables, revalidate = 60, tags }: ShopifyFetchOptions = {}
): Promise<T> {
  if (!isShopifyEnabled()) {
    throw new ShopifyError("Shopify commerce is not enabled", "disabled");
  }
  const domain = process.env.SHOPIFY_STORE_DOMAIN!;
  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  const publicToken = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (privateToken) headers["Shopify-Storefront-Private-Token"] = privateToken;
  else if (publicToken) headers["X-Shopify-Storefront-Access-Token"] = publicToken;

  let res: Response;
  try {
    res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      ...(revalidate === false
        ? { cache: "no-store" as const }
        : { next: { revalidate, tags } }),
    });
  } catch (err) {
    throw new ShopifyError(
      `Storefront API unreachable: ${err instanceof Error ? err.message : "network error"}`,
      "network_error"
    );
  }

  if (!res.ok) {
    throw new ShopifyError(`Storefront API HTTP ${res.status}`, "http_error");
  }

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new ShopifyError(json.errors.map((e) => e.message).join("; "));
  }
  if (!json.data) throw new ShopifyError("Storefront API returned no data");
  return json.data;
}
