"use client";

import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";
import { formatMoney } from "./money";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CartDrawer({ dict }: { dict: Dictionary["shop"] }) {
  const { enabled, cart, open, busy, error, closeCart, updateLine, removeLine, checkout } =
    useCart();
  const panelRef = useRef<HTMLElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      restoreRef.current = (document.activeElement as HTMLElement) ?? null;
      panelRef.current?.focus();
    } else {
      restoreRef.current?.focus?.();
    }
  }, [open]);

  // Keep keyboard focus inside the dialog while it's open (aria-modal).
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const root = panelRef.current;
    if (!root) return;
    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button, a[href], select, input, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute("disabled"));
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === root)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!enabled) return null;
  const lines = cart?.lines ?? [];

  return (
    <>
      <div
        className={`cartd-backdrop${open ? " is-on" : ""}`}
        hidden={!open}
        onClick={closeCart}
      />
      <aside
        ref={panelRef}
        className={`cartd${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={dict.cart}
        aria-hidden={!open}
        inert={!open}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className="cartd__head">
          <span className="cartd__title">{dict.cart}</span>
          <button type="button" className="cartd__close" onClick={closeCart} aria-label={dict.close}>
            ✕
          </button>
        </div>
        <div className="cartd__body">
          {lines.length === 0 ? (
            <p className="cartd__empty">{dict.cartEmpty}</p>
          ) : (
            lines.map((line) => (
              <div className="cline" key={line.id}>
                <div className="cline__img">
                  {line.merchandise.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={line.merchandise.image.url}
                      alt={line.merchandise.image.altText ?? line.merchandise.product.title}
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="cline__main">
                  <span className="cline__title">{line.merchandise.product.title}</span>
                  {line.merchandise.title !== "Default Title" && (
                    <span className="cline__variant">{line.merchandise.title}</span>
                  )}
                  <div className="cline__row">
                    <span className="qty">
                      <button
                        type="button"
                        aria-label={`${dict.quantity} −`}
                        disabled={busy}
                        onClick={() => updateLine(line.id, line.quantity - 1)}
                      >
                        −
                      </button>
                      <span aria-live="polite">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label={`${dict.quantity} +`}
                        disabled={busy}
                        onClick={() => updateLine(line.id, line.quantity + 1)}
                      >
                        +
                      </button>
                    </span>
                    <span className="cline__price">{formatMoney(line.cost.totalAmount)}</span>
                  </div>
                  <button
                    type="button"
                    className="cline__rm"
                    disabled={busy}
                    onClick={() => removeLine(line.id)}
                  >
                    {dict.remove}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="cartd__foot">
          {error && (
            <p className="cartd__err">
              {error === "network" ? dict.errNetwork : dict.errStore}
            </p>
          )}
          <div className="cartd__sum">
            <span className="k">{dict.subtotal}</span>
            <span className="v">
              {cart ? formatMoney(cart.cost.subtotalAmount) : "—"}
            </span>
          </div>
          <p className="cartd__note">{dict.checkoutNote}</p>
          <button
            type="button"
            className="btn btn--lg cartd__checkout"
            disabled={busy || lines.length === 0}
            onClick={checkout}
          >
            {dict.checkout} <span className="arrow">→</span>
          </button>
        </div>
      </aside>
    </>
  );
}
