"use server";

import { cookies } from "next/headers";
import {
  addCartLines,
  createCart,
  getCart,
  removeCartLines,
  updateCartLines,
  ShopifyError,
  type Cart,
} from "@/lib/commerce";
import { isShopifyEnabled } from "@/lib/config";

const CART_COOKIE = "ca_cart_id";

export type CartActionResult =
  | { ok: true; cart: Cart | null }
  | { ok: false; error: string };

function fail(err: unknown): CartActionResult {
  if (err instanceof ShopifyError) {
    console.error("[cart] shopify error:", err.code, err.message);
    return { ok: false, error: err.code === "network_error" ? "network" : "shopify" };
  }
  console.error("[cart] unexpected error:", err instanceof Error ? err.message : err);
  return { ok: false, error: "unknown" };
}

async function readCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

async function writeCartId(id: string): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
  });
}

export async function getCartAction(): Promise<CartActionResult> {
  if (!isShopifyEnabled()) return { ok: true, cart: null };
  try {
    const id = await readCartId();
    if (!id) return { ok: true, cart: null };
    const cart = await getCart(id);
    return { ok: true, cart };
  } catch (err) {
    return fail(err);
  }
}

export async function addToCartAction(
  merchandiseId: string,
  quantity: number
): Promise<CartActionResult> {
  if (!isShopifyEnabled()) return { ok: false, error: "disabled" };
  if (!merchandiseId || quantity < 1 || quantity > 10) {
    return { ok: false, error: "invalid" };
  }
  try {
    let id = await readCartId();
    let cart: Cart | null = null;
    if (id) cart = await getCart(id); // expired carts return null
    if (!cart) {
      cart = await createCart();
      await writeCartId(cart.id);
      id = cart.id;
    }
    cart = await addCartLines(id!, [{ merchandiseId, quantity }]);
    return { ok: true, cart };
  } catch (err) {
    return fail(err);
  }
}

export async function updateLineAction(
  lineId: string,
  quantity: number
): Promise<CartActionResult> {
  if (!isShopifyEnabled()) return { ok: false, error: "disabled" };
  try {
    const id = await readCartId();
    if (!id) return { ok: true, cart: null };
    const cart =
      quantity <= 0
        ? await removeCartLines(id, [lineId])
        : await updateCartLines(id, [{ id: lineId, quantity }]);
    return { ok: true, cart };
  } catch (err) {
    return fail(err);
  }
}

export async function removeLineAction(lineId: string): Promise<CartActionResult> {
  if (!isShopifyEnabled()) return { ok: false, error: "disabled" };
  try {
    const id = await readCartId();
    if (!id) return { ok: true, cart: null };
    const cart = await removeCartLines(id, [lineId]);
    return { ok: true, cart };
  } catch (err) {
    return fail(err);
  }
}

/* Fresh cart + checkoutUrl right before handoff to Shopify checkout. */
export async function checkoutAction(): Promise<
  { ok: true; url: string } | { ok: false; error: string }
> {
  if (!isShopifyEnabled()) return { ok: false, error: "disabled" };
  try {
    const id = await readCartId();
    if (!id) return { ok: false, error: "empty" };
    const cart = await getCart(id);
    if (!cart || cart.totalQuantity === 0) return { ok: false, error: "empty" };
    if (!cart.checkoutUrl) return { ok: false, error: "no_checkout_url" };
    return { ok: true, url: cart.checkoutUrl };
  } catch (err) {
    const r = fail(err);
    return { ok: false, error: r.ok ? "unknown" : r.error };
  }
}
