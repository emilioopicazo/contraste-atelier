import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localePath, type Locale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isShopifyEnabled } from "@/lib/config";
import { pageMetadata } from "@/lib/seo/meta";
import { getProducts, type Product } from "@/lib/commerce";
import { ProductCard } from "@/components/commerce/ProductCard";
import { TrackOnMount } from "@/components/site/TrackOnMount";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return pageMetadata({
    locale: lang,
    path: "/shop",
    title: dict.meta.shopTitle,
    description: dict.meta.shopDescription,
  });
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const enabled = isShopifyEnabled();

  let products: Product[] = [];
  let storeError = false;
  if (enabled) {
    try {
      products = await getProducts(24);
    } catch (err) {
      storeError = true;
      console.error("[shop] products failed:", err instanceof Error ? err.message : err);
    }
  }

  return (
    <main className="zone zone--paper" style={{ paddingTop: "clamp(96px,14vh,150px)" }}>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="shop-head">
            <span className="kicker">
              <span className="dot" />
              {dict.shop.kicker}
            </span>
            <h1 className="h2">{dict.shop.heading}</h1>
          </div>

          {!enabled ? (
            <div className="soon">
              <span className="soon__badge">{dict.shop.comingSoon}</span>
              <p className="lead">{dict.shop.comingSoonBody}</p>
              <Link className="link-underline" href={localePath(locale, "/workshops/wax-ring")}>
                {dict.shop.makeYourOwn} →
              </Link>
            </div>
          ) : storeError ? (
            <p className="muted">{dict.shop.unavailable}</p>
          ) : products.length === 0 ? (
            <div className="soon">
              <span className="soon__badge">{dict.shop.comingSoon}</span>
              <p className="lead">{dict.shop.comingSoonBody}</p>
            </div>
          ) : (
            <>
              <TrackOnMount event="view_item_list" params={{ item_list_id: "shop" }} />
              <div className="pgrid">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} locale={locale} dict={dict.shop} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
