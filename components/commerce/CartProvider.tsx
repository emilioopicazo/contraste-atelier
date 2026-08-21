"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Cart } from "@/lib/commerce/types";
import {
  addToCartAction,
  checkoutAction,
  getCartAction,
  removeLineAction,
  updateLineAction,
} from "@/app/actions/cart";
import { track } from "@/lib/analytics";

interface CartContextValue {
  enabled: boolean;
  cart: Cart | null;
  open: boolean;
  busy: boolean;
  error: string | null;
  openCart: () => void;
  closeCart: () => void;
  add: (merchandiseId: string, quantity?: number) => Promise<boolean>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  checkout: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart outside CartProvider");
  return ctx;
}

export function CartProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (!enabled || loaded.current) return;
    loaded.current = true;
    getCartAction().then((r) => {
      if (r.ok) setCart(r.cart);
    });
  }, [enabled]);

  useEffect(() => {
    document.documentElement.classList.toggle("cart-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const openCart = useCallback(() => {
    setOpen(true);
    track("view_cart");
  }, []);
  const closeCart = useCallback(() => setOpen(false), []);

  const add = useCallback(async (merchandiseId: string, quantity = 1) => {
    setBusy(true);
    setError(null);
    const r = await addToCartAction(merchandiseId, quantity);
    setBusy(false);
    if (r.ok) {
      setCart(r.cart);
      setOpen(true);
      return true;
    }
    setError(r.error);
    return false;
  }, []);

  const updateLine = useCallback(async (lineId: string, quantity: number) => {
    setBusy(true);
    setError(null);
    const r = await updateLineAction(lineId, quantity);
    setBusy(false);
    if (r.ok) setCart(r.cart);
    else setError(r.error);
  }, []);

  const removeLine = useCallback(async (lineId: string) => {
    setBusy(true);
    setError(null);
    const r = await removeLineAction(lineId);
    setBusy(false);
    if (r.ok) {
      setCart(r.cart);
      track("remove_from_cart");
    } else setError(r.error);
  }, []);

  const checkout = useCallback(async () => {
    setBusy(true);
    setError(null);
    const r = await checkoutAction();
    if (r.ok) {
      track("begin_checkout", {
        value: cart ? Number(cart.cost.totalAmount.amount) : undefined,
        currency: cart?.cost.totalAmount.currencyCode,
      });
      window.location.href = r.url;
      return;
    }
    setBusy(false);
    setError(r.error);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        enabled,
        cart,
        open,
        busy,
        error,
        openCart,
        closeCart,
        add,
        updateLine,
        removeLine,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
