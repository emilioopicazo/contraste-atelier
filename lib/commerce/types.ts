export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ProductImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: Money;
  selectedOptions: { name: string; value: string }[];
  image: ProductImage | null;
  sku: string | null;
}

export interface ProductMetafields {
  pieceType?: string;
  material?: string;
  finish?: string;
  dimensions?: string;
  edition?: string;
  productionMode?: "one_of_one" | "limited" | "in_stock" | "made_to_order";
  care?: string;
  story?: string;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  totalInventory: number | null;
  featuredImage: ProductImage | null;
  images: ProductImage[];
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  options: { name: string; values: string[] }[];
  variants: ProductVariant[];
  metafields: ProductMetafields;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: { handle: string; title: string };
    image: ProductImage | null;
    price: Money;
  };
  cost: { totalAmount: Money };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLine[];
  cost: { subtotalAmount: Money; totalAmount: Money };
}
