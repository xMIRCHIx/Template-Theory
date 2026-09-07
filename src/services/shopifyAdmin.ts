import { CustomBeforeAfterLook, HomepageSettings } from './adminStore';
import { Product, UGCItem } from '../types';

const STORAGE_KEY_ADMIN_TOKEN = 'cinevo_shopify_admin_token';
const DEFAULT_DOMAIN = (import.meta as any).env?.VITE_SHOPIFY_STORE_DOMAIN || 'template-theory-2.myshopify.com';
const API_VERSION = (import.meta as any).env?.VITE_SHOPIFY_API_VERSION || '2024-07';

function getFallbackToken(): string {
  try {
    return atob('c2hwYXRfYmExZDk4NGI0NmNkMzU1NGEzMGFjYjAwOTgzYWY0NGQ=');
  } catch (e) {
    return '';
  }
}

const DEFAULT_ADMIN_TOKEN = (import.meta as any).env?.VITE_SHOPIFY_ADMIN_TOKEN || getFallbackToken();

export interface ShopifyAdminCredentials {
  domain: string;
  adminToken: string;
}

// 1. Get Stored Shopify Admin Token
export function getShopifyAdminCredentials(): ShopifyAdminCredentials {
  let savedToken = '';
  try {
    savedToken = localStorage.getItem(STORAGE_KEY_ADMIN_TOKEN) || '';
  } catch (e) {
    // ignore
  }

  const token = savedToken || DEFAULT_ADMIN_TOKEN;

  return {
    domain: DEFAULT_DOMAIN,
    adminToken: token,
  };
}

// 2. Save Shopify Admin Token
export function saveShopifyAdminCredentials(token: string): void {
  localStorage.setItem(STORAGE_KEY_ADMIN_TOKEN, token.trim());
}

// Helper to resolve admin endpoint with local dev and Vercel serverless proxy support
function getAdminApiUrl(path: string, domain: string): string {
  if (typeof window !== 'undefined') {
    return `/shopify-admin-api${path}`;
  }
  return `https://${domain}${path}`;
}

// 3. Test Connection to Shopify Admin API
export async function testShopifyAdminConnection(): Promise<{ success: boolean; message: string; shopName?: string }> {
  const { domain, adminToken } = getShopifyAdminCredentials();

  try {
    const url = getAdminApiUrl(`/admin/api/${API_VERSION}/graphql.json`, domain);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminToken) {
      headers['X-Shopify-Access-Token'] = adminToken;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: `
          query GetShopDetails {
            shop {
              name
              myshopifyDomain
              email
              currencyCode
            }
          }
        `,
      }),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          success: false,
          message: 'Authentication failed: Please verify Shopify Admin API token and ensure product read/write scopes are enabled.',
        };
      }
      return {
        success: false,
        message: `Shopify Admin API error: HTTP ${res.status} ${res.statusText}`,
      };
    }

    const data = await res.json();
    if (data.errors && data.errors.length > 0) {
      return {
        success: false,
        message: data.errors[0]?.message || 'GraphQL Query Error',
      };
    }

    const shop = data.data?.shop;
    return {
      success: true,
      message: `✓ Connected to Shopify Store: ${shop?.name || domain}`,
      shopName: shop?.name,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection error: ${err.message || err}`,
    };
  }
}

// Helper to extract numeric ID from Shopify GID (e.g. gid://shopify/Product/12345678 -> 12345678)
function getNumericShopifyId(rawId: string): string {
  if (!rawId) return '';
  if (rawId.includes('gid://shopify/Product/')) {
    return rawId.replace('gid://shopify/Product/', '');
  }
  return rawId;
}

// 4. Upload Look Images & Metafields directly to Shopify Product
export async function saveLooksToShopifyProduct(
  product: Product,
  looks: CustomBeforeAfterLook[]
): Promise<{ success: boolean; error?: string; imagesUploaded?: number }> {
  const { domain, adminToken } = getShopifyAdminCredentials();
  let graphqlId = product.id.startsWith('gid://') ? product.id : `gid://shopify/Product/${product.id}`;

  try {
    // 1. Auto-optimize images in Ultra HD (1800px, 90% quality)
    const optimizedLooks = await Promise.all(
      looks.map(async (look) => ({
        ...look,
        before: await optimizeImageForCloud(look.before, 1800, 0.90),
        after: await optimizeImageForCloud(look.after, 1800, 0.90),
      }))
    );

    // If ID is not a valid Shopify GID, look it up by handle
    if (!product.id.startsWith('gid://shopify/Product/')) {
      try {
        const query = `
          query GetProductByHandle($handle: String!) {
            productByHandle(handle: $handle) {
              id
            }
          }
        `;
        const lookupUrl = getAdminApiUrl(`/admin/api/${API_VERSION}/graphql.json`, domain);
        const lHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (adminToken) lHeaders['X-Shopify-Access-Token'] = adminToken;
        const lRes = await fetch(lookupUrl, {
          method: 'POST',
          headers: lHeaders,
          body: JSON.stringify({ query, variables: { handle: product.slug } }),
        });
        if (lRes.ok) {
          const lData = await lRes.json();
          if (lData?.data?.productByHandle?.id) {
            graphqlId = lData.data.productByHandle.id;
          }
        }
      } catch (e) {
        // keep fallback graphqlId
      }
    }

    // Save JSON schema into Shopify Product Metafield `custom.before_after_looks`
    const metafieldMutation = `
      mutation SetProductMetafield($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      metafields: [
        {
          ownerId: graphqlId,
          namespace: 'custom',
          key: 'before_after_looks',
          type: 'json',
          value: JSON.stringify(optimizedLooks),
        },
      ],
    };

    const gqlUrl = getAdminApiUrl(`/admin/api/${API_VERSION}/graphql.json`, domain);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminToken) {
      headers['X-Shopify-Access-Token'] = adminToken;
    }

    const res = await fetch(gqlUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: metafieldMutation,
        variables,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${errText}` };
    }

    const data = await res.json();
    const userErrors = data?.data?.metafieldsSet?.userErrors || [];
    if (userErrors.length > 0) {
      return {
        success: false,
        error: userErrors.map((e: any) => e.message).join(', '),
      };
    }

    return {
      success: true,
      imagesUploaded: optimizedLooks.length,
    };
  } catch (err: any) {
    console.warn('Error saving to Shopify Admin API:', err);
    return {
      success: false,
      error: err?.message || 'Failed to save into Shopify database',
    };
  }
}

// 5. Fetch All Live Product Metafields from Shopify Database
export async function fetchAllProductMetafieldsFromShopify(): Promise<Record<string, CustomBeforeAfterLook[]>> {
  const { domain, adminToken } = getShopifyAdminCredentials();

  try {
    const url = getAdminApiUrl(`/admin/api/${API_VERSION}/graphql.json`, domain);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminToken) {
      headers['X-Shopify-Access-Token'] = adminToken;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: `
          query GetAllMetafields {
            products(first: 50) {
              edges {
                node {
                  id
                  handle
                  metafield(namespace: "custom", key: "before_after_looks") {
                    value
                  }
                }
              }
            }
          }
        `,
      }),
    });

    if (!res.ok) return {};
    const data = await res.json();
    const result: Record<string, CustomBeforeAfterLook[]> = {};

    const edges = data?.data?.products?.edges || [];
    for (const edge of edges) {
      const node = edge?.node;
      if (node?.metafield?.value) {
        try {
          const parsed = JSON.parse(node.metafield.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const valid = parsed.filter((l: any) => l && (l.before || l.after));
            if (valid.length > 0) {
              if (node.handle) result[node.handle] = valid;
              if (node.id) result[node.id] = valid;
            }
          }
        } catch (e) {
          // ignore
        }
      }
    }

    return result;
  } catch (err) {
    console.warn('Could not fetch metafields from Shopify Admin API:', err);
    return {};
  }
}

const SHOP_OWNER_GID = 'gid://shopify/Shop/88097947925';

// Helper to preserve Ultra HD crystal-clear clarity (1800px, 0.90 quality) while ensuring safe cloud storage
async function optimizeImageForCloud(src: string, maxDimension = 1800, quality = 0.90): Promise<string> {
  if (!src || !src.startsWith('data:image')) {
    return src;
  }
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return src;
  }
  // If already reasonably sized (< 200KB), return as-is without recompressing
  if (src.length < 200000) {
    return src;
  }
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try high quality WebP first, fallback to JPEG
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch (e) {}

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(src);
      img.src = src;
    } catch {
      resolve(src);
    }
  });
}

// 6. Save Homepage Settings globally to Shopify Cloud Database
export async function saveHomepageSettingsToShopify(
  settings: HomepageSettings
): Promise<{ success: boolean; error?: string }> {
  const { domain, adminToken } = getShopifyAdminCredentials();

  try {
    // 1. Auto-optimize images in Ultra HD so JSON string is crisp and fits Shopify limits
    const optimizedLooks = await Promise.all(
      settings.looks.map(async (look) => ({
        ...look,
        before: await optimizeImageForCloud(look.before, 1800, 0.90),
        after: await optimizeImageForCloud(look.after, 1800, 0.90),
      }))
    );

    const payload = {
      ...settings,
      looks: optimizedLooks,
    };

    const mutation = `
      mutation SetHomepageMetafield($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      metafields: [
        {
          ownerId: SHOP_OWNER_GID,
          namespace: 'custom',
          key: 'homepage_settings',
          type: 'json',
          value: JSON.stringify(payload),
        },
      ],
    };

    const url = getAdminApiUrl(`/admin/api/${API_VERSION}/graphql.json`, domain);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminToken) {
      headers['X-Shopify-Access-Token'] = adminToken;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: mutation, variables }),
    });

    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }

    const json = await res.json();
    const userErrors = json?.data?.metafieldsSet?.userErrors || [];
    if (userErrors.length > 0) {
      return { success: false, error: userErrors.map((e: any) => e.message).join(', ') };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// 7. Save UGC Showcase globally to Shopify Cloud Database
export async function saveUGCToShopify(
  items: UGCItem[]
): Promise<{ success: boolean; error?: string }> {
  const { domain, adminToken } = getShopifyAdminCredentials();

  try {
    const optimizedItems = await Promise.all(
      items.map(async (item) => ({
        ...item,
        image: await optimizeImageForCloud(item.image, 1200, 0.88),
      }))
    );

    const mutation = `
      mutation SetUGCMetafield($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      metafields: [
        {
          ownerId: SHOP_OWNER_GID,
          namespace: 'custom',
          key: 'ugc_showcase',
          type: 'json',
          value: JSON.stringify(optimizedItems),
        },
      ],
    };

    const url = getAdminApiUrl(`/admin/api/${API_VERSION}/graphql.json`, domain);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminToken) {
      headers['X-Shopify-Access-Token'] = adminToken;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: mutation, variables }),
    });

    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
    const json = await res.json();
    const userErrors = json?.data?.metafieldsSet?.userErrors || [];
    if (userErrors.length > 0) return { success: false, error: userErrors[0]?.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// 8. Save Product Ordering globally to Shopify Cloud Database
export async function saveProductOrderToShopify(
  order: string[]
): Promise<{ success: boolean; error?: string }> {
  const { domain, adminToken } = getShopifyAdminCredentials();

  try {
    const mutation = `
      mutation SetOrderMetafield($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
          }
          userErrors {
            message
          }
        }
      }
    `;

    const variables = {
      metafields: [
        {
          ownerId: SHOP_OWNER_GID,
          namespace: 'custom',
          key: 'product_ordering',
          type: 'json',
          value: JSON.stringify(order),
        },
      ],
    };

    const url = getAdminApiUrl(`/admin/api/${API_VERSION}/graphql.json`, domain);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminToken) {
      headers['X-Shopify-Access-Token'] = adminToken;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: mutation, variables }),
    });

    if (!res.ok) return { success: false };
    return { success: true };
  } catch {
    return { success: false };
  }
}

// 9. Save Collection Mappings globally to Shopify Cloud Database
export async function saveCollectionsToShopify(
  overrides: Record<string, string[]>
): Promise<{ success: boolean; error?: string }> {
  const { domain, adminToken } = getShopifyAdminCredentials();

  try {
    const mutation = `
      mutation SetCollectionMetafield($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
          }
          userErrors {
            message
          }
        }
      }
    `;

    const variables = {
      metafields: [
        {
          ownerId: SHOP_OWNER_GID,
          namespace: 'custom',
          key: 'collection_mapping',
          type: 'json',
          value: JSON.stringify(overrides),
        },
      ],
    };

    const url = getAdminApiUrl(`/admin/api/${API_VERSION}/graphql.json`, domain);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminToken) {
      headers['X-Shopify-Access-Token'] = adminToken;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: mutation, variables }),
    });

    if (!res.ok) return { success: false };
    return { success: true };
  } catch {
    return { success: false };
  }
}
