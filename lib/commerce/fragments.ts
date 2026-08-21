export const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    totalInventory
    featuredImage {
      ...ImageFields
    }
    images(first: 10) {
      nodes {
        ...ImageFields
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    options {
      name
      optionValues {
        name
      }
    }
    variants(first: 50) {
      nodes {
        id
        title
        availableForSale
        quantityAvailable
        sku
        price {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
        image {
          ...ImageFields
        }
      }
    }
    metafields(
      identifiers: [
        { namespace: "contraste", key: "piece_type" }
        { namespace: "contraste", key: "material" }
        { namespace: "contraste", key: "finish" }
        { namespace: "contraste", key: "dimensions" }
        { namespace: "contraste", key: "edition" }
        { namespace: "contraste", key: "production_mode" }
        { namespace: "contraste", key: "care" }
        { namespace: "contraste", key: "story" }
      ]
    ) {
      key
      value
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 50) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            price {
              amount
              currencyCode
            }
            image {
              ...ImageFields
            }
            product {
              handle
              title
            }
          }
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;
