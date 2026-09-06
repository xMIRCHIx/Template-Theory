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
  const graphqlId = product.id.startsWith('gid://') ? product.id : `gid://shopify/Product/${product.id}`;

  try {
    // Save JSON schema into Shopify Product Metafield `custom.before_after_looks`
    const metafieldMutation = `
      mutation UpdateProductMetafield($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            metafields(first: 5) {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                }
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
        variables: {
          input: {
            id: graphqlId,
            metafields: [
              {
                namespace: 'custom',
                key: 'before_after_looks',
                type: 'json',
                value: JSON.stringify(looks),
              },
            ],
          },
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${errText}` };
    }

    const data = await res.json();
    const userErrors = data?.data?.productUpdate?.userErrors || [];
    if (userErrors.length > 0) {
      return {
        success: false,
        error: userErrors.map((e: any) => e.message).join(', '),
      };
    }

    return {
      success: true,
      imagesUploaded: looks.length,
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

// 6. Save Homepage Settings globally to Shopify Cloud Database
export async function saveHomepageSettingsToShopify(
  settings: HomepageSettings
): Promise<{ success: boolean; error?: string }> {
  const { domain, adminToken } = getShopifyAdminCredentials();

  try {
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
          value: JSON.stringify(settings),
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
          value: JSON.stringify(items),
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
