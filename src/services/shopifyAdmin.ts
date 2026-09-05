import { CustomBeforeAfterLook } from './adminStore';
import { Product } from '../types';

const STORAGE_KEY_ADMIN_TOKEN = 'cinevo_shopify_admin_token';
const DEFAULT_DOMAIN = (import.meta as any).env?.VITE_SHOPIFY_STORE_DOMAIN || 'template-theory-2.myshopify.com';
const API_VERSION = (import.meta as any).env?.VITE_SHOPIFY_API_VERSION || '2024-07';

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

  const envToken = (import.meta as any).env?.VITE_SHOPIFY_ADMIN_TOKEN || '';
  const token = savedToken || envToken;

  return {
    domain: DEFAULT_DOMAIN,
    adminToken: token,
  };
}

// 2. Save Shopify Admin Token
export function saveShopifyAdminCredentials(token: string): void {
  localStorage.setItem(STORAGE_KEY_ADMIN_TOKEN, token.trim());
}

// 3. Test Connection to Shopify Admin API
export async function testShopifyAdminConnection(): Promise<{ success: boolean; message: string; shopName?: string }> {
  const { domain, adminToken } = getShopifyAdminCredentials();

  if (!adminToken) {
    return {
      success: false,
      message: 'Shopify Admin API Token is missing. Please enter your shpat_... token.',
    };
  }

  try {
    // Test with Admin GraphQL Shop query
    const res = await fetch(`https://${domain}/admin/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
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
          message: 'Authentication failed: Invalid Admin API token or insufficient permissions (ensure write_products and read_products scopes are enabled).',
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
    // If CORS prevents direct browser Admin API call, provide clear guidance
    if (err?.message?.includes('Failed to fetch') || err?.name === 'TypeError') {
      return {
        success: false,
        message: 'Direct browser connection blocked by Shopify CORS security. (In production, calls route via serverless proxy or token is authenticated directly).',
      };
    }
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

  if (!adminToken) {
    return {
      success: false,
      error: 'Shopify Admin API Token is not configured. Go to Tab 4 (Settings) to configure it.',
    };
  }

  const numericId = getNumericShopifyId(product.id);
  const graphqlId = product.id.startsWith('gid://') ? product.id : `gid://shopify/Product/${product.id}`;

  try {
    let imagesUploaded = 0;

    // 1. Upload Images to Product Media in Shopify with Alt tags
    for (let i = 0; i < looks.length; i++) {
      const look = looks[i];
      const lookSuffix = looks.length > 1 ? `:Look ${i + 1}` : '';

      // Upload Before Image
      if (look.before && look.before.startsWith('data:image/')) {
        const base64Data = look.before.split(',')[1];
        if (base64Data) {
          await fetch(`https://${domain}/admin/api/${API_VERSION}/products/${numericId}/images.json`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': adminToken,
            },
            body: JSON.stringify({
              image: {
                attachment: base64Data,
                alt: `before${lookSuffix}`,
              },
            }),
          });
          imagesUploaded++;
        }
      } else if (look.before && look.before.startsWith('http')) {
        // Source URL upload
        await fetch(`https://${domain}/admin/api/${API_VERSION}/products/${numericId}/images.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': adminToken,
          },
          body: JSON.stringify({
            image: {
              src: look.before,
              alt: `before${lookSuffix}`,
            },
          }),
        });
        imagesUploaded++;
      }

      // Upload After Image
      if (look.after && look.after.startsWith('data:image/')) {
        const base64Data = look.after.split(',')[1];
        if (base64Data) {
          await fetch(`https://${domain}/admin/api/${API_VERSION}/products/${numericId}/images.json`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': adminToken,
            },
            body: JSON.stringify({
              image: {
                attachment: base64Data,
                alt: `after${lookSuffix}`,
              },
            }),
          });
          imagesUploaded++;
        }
      } else if (look.after && look.after.startsWith('http')) {
        // Source URL upload
        await fetch(`https://${domain}/admin/api/${API_VERSION}/products/${numericId}/images.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': adminToken,
          },
          body: JSON.stringify({
            image: {
              src: look.after,
              alt: `after${lookSuffix}`,
            },
          }),
        });
        imagesUploaded++;
      }
    }

    // 2. Also save JSON schema into Shopify Product Metafield `custom.before_after_looks`
    const metafieldMutation = `
      mutation UpdateProductMetafield($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            metafields(first: 5) {
              edges {
                node {
                  id
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

    await fetch(`https://${domain}/admin/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
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

    return {
      success: true,
      imagesUploaded,
    };
  } catch (err: any) {
    console.warn('Error saving to Shopify Admin API:', err);
    return {
      success: false,
      error: err?.message || 'Failed to save into Shopify database',
    };
  }
}
