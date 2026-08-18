import type { Money } from "@/lib/commerce/types";

/* Formats Shopify MoneyV2 without hardcoding currency behavior. */
export function formatMoney(money: Money): string {
  const amount = Number(money.amount);
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `$${formatted} ${money.currencyCode}`;
}
