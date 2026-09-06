import { Product, ProductCategory } from '../types';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';

const SHOPIFY_DOMAIN = (import.meta as any).env?.VITE_SHOPIFY_STORE_DOMAIN || 'template-theory-2.myshopify.com';
const SHOPIFY_STOREFRONT_TOKEN = (import.meta as any).env?.VITE_SHOPIFY_STOREFRONT_TOKEN || 'e9c5ed69764a1c1ee180980e3e8a5434';
const SHOPIFY_API_VERSION = (import.meta as any).env?.VITE_SHOPIFY_API_VERSION || '2024-07';

const GRAPHQL_ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

export async function shopifyFetch<T>({
  query,
  variables = {},
}: {
  query: string;
  variables?: Record<string, any>;
}): Promise<T> {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      throw new Error(`Shopify network error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    if (json.errors && json.errors.length > 0) {
      console.warn('Shopify GraphQL Errors:', json.errors);
      throw new Error(json.errors[0]?.message || 'Shopify GraphQL query error');
    }

    return json.data as T;
  } catch (error) {
    console.error('Error executing Shopify Storefront GraphQL query:', error);
    throw error;
  }
}

// Queries
export const GET_ALL_PRODUCTS_QUERY = `
  query GetAllProducts($first: Int = 50) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          descriptionHtml
          productType
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            url
            altText
          }
          images(first: 20) {
            edges {
              node {
                url
                altText
              }
            }
          }
          metafield(namespace: "custom", key: "before_after_looks") {
            value
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
        }
      }
    }
    collections(first: 20) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
          }
        }
      }
    }
    shop {
      name
      homepageSettings: metafield(namespace: "custom", key: "homepage_settings") {
        value
      }
      ugcShowcase: metafield(namespace: "custom", key: "ugc_showcase") {
        value
      }
      productOrdering: metafield(namespace: "custom", key: "product_ordering") {
        value
      }
      collectionMapping: metafield(namespace: "custom", key: "collection_mapping") {
        value
      }
    }
  }
`;

export const CREATE_CART_MUTATION = `
  mutation CreateCart($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Helper to determine category from product title, tags or productType
function inferCategory(node: any): ProductCategory {
  const text = `${node.title || ''} ${node.productType || ''} ${(node.tags || []).join(' ')}`.toLowerCase();
  if (text.includes('preset') || text.includes('lightroom') || text.includes('xmp') || text.includes('dng')) return 'presets';
  if (text.includes('lut') || text.includes('cube')) return 'luts';
  if (text.includes('album') || text.includes('psd') || text.includes('photoshop') || text.includes('mockup') || text.includes('stationery') || text.includes('lookbook')) return 'psds';
  if (text.includes('font') || text.includes('typeface') || text.includes('otf') || text.includes('ttf') || text.includes('serif')) return 'fonts';
  return 'assets';
}

function extractBeforeAfterFromShopify(node: any): {
  beforeAfterImage?: { before: string; after: string };
  beforeAfterList?: Array<{ id: string; title: string; before: string; after: string }>;
} {
  // 1. Check if Shopify Product has custom.before_after_looks JSON metafield
  if (node.metafield?.value) {
    try {
      const parsed = JSON.parse(node.metafield.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed.filter((look: any) => look && (look.before || look.after));
        if (valid.length > 0) {
          return {
            beforeAfterImage: { before: valid[0].before || '', after: valid[0].after || '' },
            beforeAfterList: valid,
          };
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return {};
}

// Convert Shopify GraphQL Product Node to our app's Product type
export function mapShopifyProductToAppProduct(node: any): Product {
  const images = (node.images?.edges || []).map((e: any) => e.node.url);
  const featured = node.featuredImage?.url || images[0] || '';
  
  const firstVariant = node.variants?.edges?.[0]?.node;
  const price = parseFloat(firstVariant?.price?.amount || node.priceRange?.minVariantPrice?.amount || '0');
  const compareAtPrice = parseFloat(firstVariant?.compareAtPrice?.amount || node.compareAtPriceRange?.maxVariantPrice?.amount || '0');
  const currencyCode = firstVariant?.price?.currencyCode || node.priceRange?.minVariantPrice?.currencyCode || 'INR';

  const category = inferCategory(node);

  // Check if Shopify has custom Before/After uploaded via Alt tags
  const shopifyBA = extractBeforeAfterFromShopify(node);

  // Check if matching fallback product exists with exact same slug
  const matchingFallback = FALLBACK_PRODUCTS.find((p) => p.slug === node.handle);

  const beforeAfterImage = shopifyBA.beforeAfterImage;
  const beforeAfterList = shopifyBA.beforeAfterList;

  const tags = (node.tags || []).map((t: string) => t.toLowerCase());

  return {
    id: node.id,
    slug: node.handle,
    name: node.title,
    category,
    price: Math.round(price),
    compareAtPrice: compareAtPrice > price ? Math.round(compareAtPrice) : undefined,
    rating: 4.9,
    reviews: 120 + (node.title.length % 50),
    tagline: 'Professional Digital Assets for Modern Creators',
    shortDescription: node.description ? node.description.slice(0, 160) + '...' : 'Premium creator tools for your workflow.',
    description: node.description || 'High quality digital products handcrafted for content creators and designers.',
    thumbnail: featured,
    gallery: images.length > 0 ? images : [featured],
    tags: tags.length > 0 ? tags : [category, 'creative', 'tools'],
    included: [
      'Instant Digital Download',
      'Commercial License Included',
      'Step-by-Step Installation Guide',
      'Lifetime Free Updates',
    ],
    format: category === 'luts' ? ['.CUBE', '.3DL'] : category === 'fonts' ? ['.OTF', '.TTF', '.WOFF2'] : category === 'presets' ? ['.XMP', '.DNG'] : ['.PSD', '.PNG'],
    compatibility: ['Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'Lightroom', 'Photoshop'],
    fileSize: '48 MB',
    version: '2.0',
    license: 'commercial',
    featured: true,
    bestseller: price >= 400,
    new: true,
    itemCount: category === 'presets' ? '30 Presets' : category === 'fonts' ? '25+ Fonts' : category === 'luts' ? '50 LUTs' : 'Complete Pack',
    beforeAfterImage,
    beforeAfterList,
    fontPreviewText: matchingFallback?.fontPreviewText || 'Template Theory Crafted for Creators',
    shopifyVariantId: firstVariant?.id,
    currencyCode,
  };
}

import {
  saveSavedHomepageSettings,
  saveSavedUGCItems,
  saveSavedProductOrder,
  saveSavedCollectionOverrides,
} from './adminStore';

// Fetch live products
export async function fetchLiveShopifyProducts(): Promise<Product[]> {
  try {
    const data = await shopifyFetch<any>({ query: GET_ALL_PRODUCTS_QUERY });

    // Hydrate Global Customizations stored in Shopify Shop Metafields (accessible to every visitor worldwide!)
    const shopNode = data?.shop;
    if (shopNode) {
      if (shopNode.homepageSettings?.value) {
        try {
          const parsed = JSON.parse(shopNode.homepageSettings.value);
          if (parsed && Array.isArray(parsed.looks) && parsed.looks.length > 0) {
            saveSavedHomepageSettings(parsed);
          }
        } catch (e) {}
      }
      if (shopNode.ugcShowcase?.value) {
        try {
          const parsed = JSON.parse(shopNode.ugcShowcase.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            saveSavedUGCItems(parsed);
          }
        } catch (e) {}
      }
      if (shopNode.productOrdering?.value) {
        try {
          const parsed = JSON.parse(shopNode.productOrdering.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            saveSavedProductOrder(parsed);
          }
        } catch (e) {}
      }
      if (shopNode.collectionMapping?.value) {
        try {
          const parsed = JSON.parse(shopNode.collectionMapping.value);
          if (parsed && typeof parsed === 'object') {
            saveSavedCollectionOverrides(parsed);
          }
        } catch (e) {}
      }
    }

    const productEdges = data?.products?.edges || [];
    if (productEdges.length === 0) {
      return [];
    }

    return productEdges.map((edge: any) => mapShopifyProductToAppProduct(edge.node));
  } catch (err) {
    console.warn('Shopify product fetch error:', err);
    return [];
  }
}

// Create Shopify Checkout Session URL
export async function createShopifyCheckoutSession(
  items: Array<{ shopifyVariantId?: string; quantity: number }>
): Promise<string | null> {
  try {
    const validLines = items
      .filter((item) => Boolean(item.shopifyVariantId))
      .map((item) => ({
        merchandiseId: item.shopifyVariantId,
        quantity: item.quantity,
      }));

    if (validLines.length === 0) {
      // If items don't have a variant ID, redirect to shopify store root or checkout
      return `https://${SHOPIFY_DOMAIN}/checkout`;
    }

    const data = await shopifyFetch<any>({
      query: CREATE_CART_MUTATION,
      variables: { lines: validLines },
    });

    const checkoutUrl = data?.cartCreate?.cart?.checkoutUrl;
    return checkoutUrl || `https://${SHOPIFY_DOMAIN}/checkout`;
  } catch (err) {
    console.error('Failed to create Shopify cart checkout session:', err);
    return `https://${SHOPIFY_DOMAIN}/checkout`;
  }
}
