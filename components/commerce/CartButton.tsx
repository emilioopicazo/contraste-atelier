"use client";

import { useCart } from "./CartProvider";

export function CartButton({ label }: { label: string }) {
  const { cart, openCart, enabled } = useCart();
  if (!enabled) return null;
  const count = cart?.totalQuantity ?? 0;
  return (
    <button type="button" className="cart-btn" onClick={openCart} aria-label={label}>
      <span>Cart</span>
      <span className="cart-count" data-empty={String(count === 0)} aria-hidden={count === 0}>
        {count}
      </span>
    </button>
  );
}
