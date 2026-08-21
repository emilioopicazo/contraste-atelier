"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/commerce/types";
import { VariantPanel } from "./VariantPanel";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/* Couples the gallery with variant selection so choosing a variant swaps
   the primary image to that combination when Shopify provides one. */

export function PdpMedia({
  product,
  dict,
  specs,
}: {
  product: Product;
  dict: Dictionary["shop"];
  specs: React.ReactNode;
}) {
  const [override, setOverride] = useState<string | null>(null);
  const primary = override ?? product.featuredImage?.url ?? product.images[0]?.url ?? null;
  const rest = product.images.filter((img) => img.url !== primary).slice(0, 4);

  return (
    <div className="pdp">
      <div className="pdp__gallery">
        {primary && (
          <div className="pdp__img">
            <Image
              src={primary}
              alt={product.featuredImage?.altText ?? product.title}
              width={1200}
              height={1200}
              priority
              sizes="(max-width: 860px) 100vw, 50vw"
            />
          </div>
        )}
        {rest.map((img) => (
          <div className="pdp__img" key={img.url}>
            <Image
              src={img.url}
              alt={img.altText ?? product.title}
              width={img.width || 1000}
              height={img.height || 1000}
              loading="lazy"
              sizes="(max-width: 860px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>
      <div>
        <h1 className="pdp__title">{product.title}</h1>
        <VariantPanel product={product} dict={dict} onImageChange={setOverride} />
        {specs}
      </div>
    </div>
  );
}
