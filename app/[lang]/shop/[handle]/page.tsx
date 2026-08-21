import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localePath, type Locale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SITE_URL, isShopifyEnabled } from "@/lib/config";
import { pageMetadata, buildCanonical } from "@/lib/seo/meta";
import { buildBreadcrumbJsonLd, buildProductJsonLd } from "@/lib/seo/jsonld";
import { getProductByHandle, type Product } from "@/lib/commerce";
import { PdpMedia } from "@/components/commerce/PdpGallery";
import { productFlag } from "@/components/commerce/ProductCard";
import { TrackOnMount } from "@/components/site/TrackOnMount";

export const revalidate = 30; // availability freshness over static caching

async function loadProduct(handle: string): Promise<Product | null> {
  if (!isShopifyEnabled()) return null;
  try {
    return await getProductByHandle(handle);
  } catch (err) {
    console.error("[shop] product failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; handle: string }>;
}): Promise<Metadata> {
  const { lang, handle } = await params;
  if (!isLocale(lang)) return {};
  const product = await loadProduct(handle);
  if (!product) return { robots: { index: false } };
  return pageMetadata({
    locale: lang,
    path: `/shop/${handle}`,
    title: `${product.title} — Contraste Atelier`,
    description: product.description.slice(0, 300),
    image: product.featuredImage?.url,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; handle: string }>;
}) {
  const { lang, handle } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  if (!isShopifyEnabled()) notFound();
  const product = await loadProduct(handle);
  if (!product) notFound();

  const url = buildCanonical(locale, `/shop/${handle}`);
  const productJsonLd = buildProductJsonLd({
    name: product.title,
    description: product.description,
    url,
    images: product.images.map((i) => i.url),
    sku: product.variants[0]?.sku ?? undefined,
    price: product.priceRange.minVariantPrice.amount,
    currency: product.priceRange.minVariantPrice.currencyCode,
    availableForSale: product.availableForSale,
  });
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Contraste Atelier", url: SITE_URL },
    { name: dict.nav.shop, url: buildCanonical(locale, "/shop") },
    { name: product.title, url },
  ]);
  const flag = productFlag(product, dict.shop);

  const specs = (
    <>
      {flag && <span className="pdp__flag">{flag}</span>}
      {product.descriptionHtml && (
        <div
          className="pdp__desc"
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
        />
      )}
      <ul className="pdp__specs">
        {product.metafields.material && (
          <li><span className="k">{dict.shop.material}</span> {product.metafields.material}</li>
        )}
        {product.metafields.dimensions && (
          <li><span className="k">{dict.shop.dimensions}</span> {product.metafields.dimensions}</li>
        )}
        {product.metafields.finish && (
          <li><span className="k">{dict.shop.finish}</span> {product.metafields.finish}</li>
        )}
        {product.metafields.edition && (
          <li><span className="k">{dict.shop.edition}</span> {product.metafields.edition}</li>
        )}
        {product.metafields.care && (
          <li><span className="k">{dict.shop.care}</span> {product.metafields.care}</li>
        )}
      </ul>
      <p className="pdp__note">{dict.shop.pickupNote}</p>
      <p className="pdp__cross">
        <Link className="link-underline" href={localePath(locale, "/workshops/wax-ring")}>
          {dict.shop.makeYourOwn} →
        </Link>
      </p>
    </>
  );

  return (
    <main className="zone zone--paper" style={{ paddingTop: "clamp(96px,14vh,150px)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <TrackOnMount event="view_item" params={{ item_id: product.handle }} />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p style={{ marginBottom: 28 }}>
            <Link className="link-underline" href={localePath(locale, "/shop")}>
              ← {dict.shop.continueShopping}
            </Link>
          </p>
          <PdpMedia product={product} dict={dict.shop} specs={specs} />
        </div>
      </section>
    </main>
  );
}
