"use client";

import { useMemo, useState } from "react";
import type { Product, ProductVariant } from "@/lib/commerce/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useCart } from "./CartProvider";
import { formatMoney } from "./money";
import { track } from "@/lib/analytics";

/* Variant selection updates price, availability, image and the exact
   merchandise id sent to the cart (spec §43). */

export function VariantPanel({
  product,
  dict,
  onImageChange,
}: {
  product: Product;
  dict: Dictionary["shop"];
  onImageChange?: (url: string | null) => void;
}) {
  const { add, busy, enabled } = useCart();
  const hasOptions =
    product.options.length > 0 &&
    !(product.options.length === 1 && product.options[0].values.length === 1);

  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const first = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
    const out: Record<string, string> = {};
    first?.selectedOptions.forEach((o) => (out[o.name] = o.value));
    return out;
  });
  const [added, setAdded] = useState(false);

  const selected: ProductVariant | undefined = useMemo(
    () =>
      product.variants.find((v) =>
        v.selectedOptions.every((o) => selection[o.name] === o.value)
      ),
    [product.variants, selection]
  );

  const pick = (option: string, value: string) => {
    const next = { ...selection, [option]: value };
    setSelection(next);
    const variant = product.variants.find((v) =>
      v.selectedOptions.every((o) => next[o.name] === o.value)
    );
    track("select_item", { item_id: product.handle, variant: variant?.title });
    onImageChange?.(variant?.image?.url ?? null);
  };

  const optionAvailable = (option: string, value: string) =>
    product.variants.some(
      (v) =>
        v.availableForSale &&
        v.selectedOptions.every((o) =>
          o.name === option ? o.value === value : selection[o.name] === o.value
        )
    );

  const canBuy = enabled && selected?.availableForSale;

  const onAdd = async () => {
    if (!selected) return;
    track("add_to_cart", {
      item_id: product.handle,
      variant: selected.title,
      value: Number(selected.price.amount),
      currency: selected.price.currencyCode,
    });
    const ok = await add(selected.id, 1);
    if (ok) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1600);
    }
  };

  return (
    <div>
      <p className="pdp__price" aria-live="polite">
        {selected ? formatMoney(selected.price) : formatMoney(product.priceRange.minVariantPrice)}
      </p>

      {hasOptions && (
        <div className="vsel">
          {product.options.map((opt) => (
            <div className="vsel__group" key={opt.name}>
              <span className="label">{opt.name}</span>
              <div className="vsel__opts" role="group" aria-label={opt.name}>
                {opt.values.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="vsel__opt"
                    aria-pressed={selection[opt.name] === value}
                    disabled={!optionAvailable(opt.name, value)}
                    onClick={() => pick(opt.name, value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pdp__cta">
        <button
          type="button"
          className="btn btn--lg"
          disabled={!canBuy || busy}
          onClick={onAdd}
        >
          {!selected || !selected.availableForSale
            ? dict.soldOut
            : busy
              ? dict.adding
              : added
                ? "✓"
                : dict.addToCart}
        </button>
      </div>
    </div>
  );
}
