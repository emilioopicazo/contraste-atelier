import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/commerce/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { formatMoney } from "./money";

/* Scarcity flags derive only from real Shopify state (spec §49). */
export function productFlag(
  p: Product,
  dict: Dictionary["shop"]
): string | null {
  if (!p.availableForSale) return dict.soldOut;
  if (p.metafields.productionMode === "one_of_one") return dict.oneOfOne;
  if (p.totalInventory !== null && p.totalInventory === 1) return dict.lastPiece;
  if (p.totalInventory !== null && p.totalInventory === 2) return dict.onlyLeft(2);
  return null;
}

export function ProductCard({
  product,
  locale,
  dict,
}: {
  product: Product;
  locale: Locale;
  dict: Dictionary["shop"];
}) {
  const flag = productFlag(product, dict);
  const img = product.featuredImage;
  return (
    <Link
      className={`pcard${product.availableForSale ? "" : " pcard--sold"}`}
      href={localePath(locale, `/shop/${product.handle}`)}
    >
      <div className="pcard__media">
        {img && (
          <Image
            src={img.url}
            alt={img.altText ?? product.title}
            width={img.width || 800}
            height={img.height || 800}
            sizes="(max-width: 560px) 100vw, (max-width: 960px) 50vw, 33vw"
          />
        )}
        {flag && <span className="pcard__flag">{flag}</span>}
      </div>
      <div className="pcard__row">
        <span className="pcard__title">{product.title}</span>
        <span className="pcard__price">{formatMoney(product.priceRange.minVariantPrice)}</span>
      </div>
      {(product.metafields.pieceType || product.metafields.material) && (
        <span className="pcard__meta">
          {[product.metafields.pieceType, product.metafields.material]
            .filter(Boolean)
            .join(" · ")}
        </span>
      )}
    </Link>
  );
}
