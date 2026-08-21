import Link from "next/link";
import { getProducts } from "@/lib/commerce";
import { localePath, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { ProductCard } from "./ProductCard";

/* Home shop module: real products when Shopify is enabled; renders the
   coming-soon module on any storefront error (never fake products). */
export async function FeaturedProducts({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary["shop"];
}) {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    products = await getProducts(3);
  } catch (err) {
    console.error("[shop] featured products failed:", err instanceof Error ? err.message : err);
  }

  if (products.length === 0) {
    return (
      <div className="shop-module">
        <div className="shop-module__l">
          <span className="soon__badge">{dict.comingSoon}</span>
          <h3>{dict.comingSoonBody}</h3>
        </div>
        <span className="shop-module__tag">{dict.kicker}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="shop-module" style={{ marginBottom: "clamp(24px,4vw,40px)" }}>
        <div className="shop-module__l">
          <span className="kicker">
            <span className="dot" />
            {dict.kicker}
          </span>
          <h3>{dict.heading}</h3>
        </div>
        <Link className="link-underline" href={localePath(locale, "/shop")}>
          {dict.viewCollection} →
        </Link>
      </div>
      <div className="pgrid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} locale={locale} dict={dict} />
        ))}
      </div>
    </div>
  );
}
