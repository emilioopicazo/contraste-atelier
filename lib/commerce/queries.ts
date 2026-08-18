import "server-only";
import { shopifyFetch, ShopifyError } from "./shopify";
import { PRODUCT_FRAGMENT } from "./fragments";
import type { Collection, Product, ProductMetafields } from "./types";

/* Raw Storefront shapes → domain types. */

interface RawMetafield {
  key: string;
  value: string;
}

interface RawProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  totalInventory: number | null;
  featuredImage: Product["featuredImage"];
  images: { nodes: Product["images"] };
  priceRange: Product["priceRange"];
  options: { name: string; optionValues: { name: string }[] }[];
  variants: { nodes: Product["variants"] };
  metafields: (RawMetafield | null)[];
}

function mapMetafields(raw: (RawMetafield | null)[]): ProductMetafields {
  const out: ProductMetafields = {};
  for (const mf of raw) {
    if (!mf?.value) continue;
    switch (mf.key) {
      case "piece_type": out.pieceType = mf.value; break;
      case "material": out.material = mf.value; break;
      case "finish": out.finish = mf.value; break;
      case "dimensions": out.dimensions = mf.value; break;
      case "edition": out.edition = mf.value; break;
      case "production_mode":
        if (["one_of_one", "limited", "in_stock", "made_to_order"].includes(mf.value)) {
          out.productionMode = mf.value as ProductMetafields["productionMode"];
        }
        break;
      case "care": out.care = mf.value; break;
      case "story": out.story = mf.value; break;
    }
  }
  return out;
}

function mapProduct(raw: RawProduct): Product {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    descriptionHtml: raw.descriptionHtml,
    availableForSale: raw.availableForSale,
    totalInventory: raw.totalInventory,
    featuredImage: raw.featuredImage,
    images: raw.images.nodes,
    priceRange: raw.priceRange,
    options: raw.options.map((o) => ({
      name: o.name,
      values: o.optionValues.map((v) => v.name),
    })),
    variants: raw.variants.nodes,
    metafields: mapMetafields(raw.metafields ?? []),
  };
}

export async function getProducts(first = 24): Promise<Product[]> {
  const data = await shopifyFetch<{ products: { nodes: RawProduct[] } }>(
    /* GraphQL */ `
      query Products($first: Int!) {
        products(first: $first, sortKey: CREATED_AT, reverse: true) {
          nodes {
            ...ProductFields
          }
        }
      }
      ${PRODUCT_FRAGMENT}
    `,
    { variables: { first }, revalidate: 60, tags: ["products"] }
  );
  return data.products.nodes.map(mapProduct);
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{ product: RawProduct | null }>(
    /* GraphQL */ `
      query ProductByHandle($handle: String!) {
        product(handle: $handle) {
          ...ProductFields
        }
      }
      ${PRODUCT_FRAGMENT}
    `,
    { variables: { handle }, revalidate: 30, tags: ["products", `product:${handle}`] }
  );
  return data.product ? mapProduct(data.product) : null;
}

export async function getCollections(): Promise<Collection[]> {
  const data = await shopifyFetch<{
    collections: { nodes: Collection[] };
  }>(
    /* GraphQL */ `
      query Collections {
        collections(first: 10) {
          nodes {
            id
            handle
            title
            description
          }
        }
      }
    `,
    { revalidate: 300, tags: ["collections"] }
  );
  return data.collections.nodes;
}

export async function getCollectionProducts(handle: string, first = 24): Promise<Product[]> {
  const data = await shopifyFetch<{
    collection: { products: { nodes: RawProduct[] } } | null;
  }>(
    /* GraphQL */ `
      query CollectionProducts($handle: String!, $first: Int!) {
        collection(handle: $handle) {
          products(first: $first) {
            nodes {
              ...ProductFields
            }
          }
        }
      }
      ${PRODUCT_FRAGMENT}
    `,
    { variables: { handle, first }, revalidate: 60, tags: ["collections", "products"] }
  );
  return data.collection?.products.nodes.map(mapProduct) ?? [];
}

export async function getProductHandles(): Promise<string[]> {
  try {
    const data = await shopifyFetch<{
      products: { nodes: { handle: string }[] };
    }>(
      /* GraphQL */ `
        query ProductHandles {
          products(first: 250) {
            nodes {
              handle
            }
          }
        }
      `,
      { revalidate: 300, tags: ["products"] }
    );
    return data.products.nodes.map((p) => p.handle);
  } catch (err) {
    if (err instanceof ShopifyError && err.code === "disabled") return [];
    console.error("[commerce] getProductHandles failed:", err instanceof Error ? err.message : err);
    return [];
  }
}
