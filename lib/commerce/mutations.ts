import "server-only";
import { shopifyFetch, ShopifyError } from "./shopify";
import { CART_FRAGMENT } from "./fragments";
import type { Cart, CartLine } from "./types";

interface RawCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: Cart["cost"];
  lines: { nodes: CartLine[] };
}

interface UserError {
  field: string[] | null;
  message: string;
}

function mapCart(raw: RawCart): Cart {
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    cost: raw.cost,
    lines: raw.lines.nodes,
  };
}

function throwOnUserErrors(errors: UserError[] | undefined) {
  if (errors?.length) {
    throw new ShopifyError(errors.map((e) => e.message).join("; "));
  }
}

export async function createCart(): Promise<Cart> {
  const data = await shopifyFetch<{
    cartCreate: { cart: RawCart | null; userErrors: UserError[] };
  }>(
    /* GraphQL */ `
      mutation CartCreate {
        cartCreate {
          cart {
            ...CartFields
          }
          userErrors {
            field
            message
          }
        }
      }
      ${CART_FRAGMENT}
    `,
    { revalidate: false }
  );
  throwOnUserErrors(data.cartCreate.userErrors);
  if (!data.cartCreate.cart) throw new ShopifyError("cartCreate returned no cart");
  return mapCart(data.cartCreate.cart);
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: RawCart | null }>(
    /* GraphQL */ `
      query GetCart($cartId: ID!) {
        cart(id: $cartId) {
          ...CartFields
        }
      }
      ${CART_FRAGMENT}
    `,
    { variables: { cartId }, revalidate: false }
  );
  return data.cart ? mapCart(data.cart) : null;
}

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: RawCart | null; userErrors: UserError[] };
  }>(
    /* GraphQL */ `
      mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFields
          }
          userErrors {
            field
            message
          }
        }
      }
      ${CART_FRAGMENT}
    `,
    { variables: { cartId, lines }, revalidate: false }
  );
  throwOnUserErrors(data.cartLinesAdd.userErrors);
  if (!data.cartLinesAdd.cart) throw new ShopifyError("cartLinesAdd returned no cart");
  return mapCart(data.cartLinesAdd.cart);
}

export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: RawCart | null; userErrors: UserError[] };
  }>(
    /* GraphQL */ `
      mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFields
          }
          userErrors {
            field
            message
          }
        }
      }
      ${CART_FRAGMENT}
    `,
    { variables: { cartId, lines }, revalidate: false }
  );
  throwOnUserErrors(data.cartLinesUpdate.userErrors);
  if (!data.cartLinesUpdate.cart) throw new ShopifyError("cartLinesUpdate returned no cart");
  return mapCart(data.cartLinesUpdate.cart);
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesRemove: { cart: RawCart | null; userErrors: UserError[] };
  }>(
    /* GraphQL */ `
      mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            ...CartFields
          }
          userErrors {
            field
            message
          }
        }
      }
      ${CART_FRAGMENT}
    `,
    { variables: { cartId, lineIds }, revalidate: false }
  );
  throwOnUserErrors(data.cartLinesRemove.userErrors);
  if (!data.cartLinesRemove.cart) throw new ShopifyError("cartLinesRemove returned no cart");
  return mapCart(data.cartLinesRemove.cart);
}
