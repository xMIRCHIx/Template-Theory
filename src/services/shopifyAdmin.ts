import { CustomBeforeAfterLook, HomepageSettings } from './adminStore';
import { Product, UGCItem } from '../types';

const STORAGE_KEY_ADMIN_TOKEN = 'cinevo_shopify_admin_token';
const DEFAULT_DOMAIN = (import.meta as any).env?.VITE_SHOPIFY_STORE_DOMAIN || 'template-theory-2.myshopify.com';
const API_VERSION = (import.meta as any).env?.VITE_SHOPIFY_API_VERSION || '2024-07';

const DEFAULT_ADMIN_TOKEN = (import.meta as any).env?.VITE_SHOPIFY_ADMIN_TOKEN || '';

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

// Upload image file directly to Shopify CDN via Staged Uploads
export async function uploadImageFileToShopifyCdn(
  file: File,
  productId = 'gid://shopify/Product/9574721159445'
): Promise<string> {
  const { domain, adminToken } = getShopifyAdminCredentials();

  // 1. Request Staged Upload Target from Shopify
  const stagedMutation = `
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
        userErrors { field message }
      }
    }
  `;

  const gqlUrl = getAdminApiUrl(`/admin/api/${API_VERSION}/graphql.json`, domain);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (adminToken) headers['X-Shopify-Access-Token'] = adminToken;

  const stagedRes = await fetch(gqlUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: stagedMutation,
      variables: {
        input: [{
          resource: 'IMAGE',
          filename: file.name || 'image.jpg',
          mimeType: file.type || 'image/jpeg',
          httpMethod: 'POST'
        }]
      }
    })
  });

  if (!stagedRes.ok) {
    throw new Error(`Staged upload initiation failed: HTTP ${stagedRes.status}`);
  }

  const stagedData = await stagedRes.json();
  const target = stagedData?.data?.stagedUploadsCreate?.stagedTargets?.[0];
  if (!target || !target.url) {
    const err = stagedData?.data?.stagedUploadsCreate?.userErrors?.[0]?.message || 'No upload target returned by Shopify';
    throw new Error(err);
  }

  // 2. Direct upload to Shopify's Google Cloud Storage
  const formData = new FormData();
  for (const param of target.parameters) {
    formData.append(param.name, param.value);
  }
  formData.append('file', file, file.name || 'image.jpg');

  const uploadRes = await fetch(target.url, {
    method: 'POST',
    body: formData
  });

  if (!uploadRes.ok && uploadRes.status !== 201) {
    throw new Error(`Cloud storage upload failed: HTTP ${uploadRes.status}`);
  }

  // 3. Register as Shopify Media to obtain permanent CDN URL
  const targetProductId = productId && productId.startsWith('gid://shopify/Product/')
    ? productId
    : (productId ? `gid://shopify/Product/${productId}` : 'gid://shopify/Product/9574721159445');

  const createMediaMutation = `
    mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
      productCreateMedia(media: $media, productId: $productId) {
        media {
          id
          mediaContentType
          status
          ... on MediaImage {
            image { url }
          }
        }
        mediaUserErrors { field message }
      }
    }
  `;

  const mediaRes = await fetch(gqlUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: createMediaMutation,
      variables: {
        productId: targetProductId,
        media: [{
          originalSource: target.resourceUrl,
          mediaContentType: 'IMAGE'
        }]
      }
    })
  });

  const mediaData = await mediaRes.json();
  const created = mediaData?.data?.productCreateMedia?.media?.[0];
  if (!created) {
    return target.resourceUrl;
  }

  if (created.image?.url) {
    return created.image.url;
  }

  // 4. Poll for finalized CDN URL
  for (let i = 0; i < 6; i++) {
    await new Promise((r) => setTimeout(r, 700));
    try {
      const checkRes = await fetch(gqlUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: `query { node(id: "${created.id}") { ... on MediaImage { status image { url } } } }`
        })
      });
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        const readyUrl = checkData?.data?.node?.image?.url;
        if (readyUrl) return readyUrl;
      }
    } catch {
      // keep checking
    }
  }

  return target.resourceUrl;
}

// Convert any Base64 data URL into permanent Shopify CDN URL
export async function ensureShopifyCdnUrl(urlOrData: string, productId?: string): Promise<string> {
  if (!urlOrData || !urlOrData.startsWith('data:image/')) {
    return urlOrData;
  }
  try {
    const res = await fetch(urlOrData);
    const blob = await res.blob();
    const mime = urlOrData.substring(urlOrData.indexOf(':') + 1, urlOrData.indexOf(';'));
    const ext = mime.split('/')[1] || 'jpg';
    const file = new File([blob], `look_${Date.now()}.${ext}`, { type: mime });
    const cdnUrl = await uploadImageFileToShopifyCdn(file, productId);
    return cdnUrl || urlOrData;
  } catch (err) {
    console.warn('Could not convert base64 to Shopify CDN URL:', err);
    return urlOrData;
  }
}

// 4. Upload Look Images & Metafields directly to Shopify Product
export async function saveLooksToShopifyProduct(
  product: Product,
  looks: CustomBeforeAfterLook[]
): Promise<{ success: boolean; error?: string; imagesUploaded?: number; savedLooks?: CustomBeforeAfterLook[] }> {
  const { domain, adminToken } = getShopifyAdminCredentials();
  let graphqlId = product.id.startsWith('gid://') ? product.id : `gid://shopify/Product/${product.id}`;

  try {
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

    // 1. Auto-upload and convert any base64 images directly to Shopify CDN!
    const cdnLooks = await Promise.all(
      looks.map(async (look) => ({
        ...look,
        before: await ensureShopifyCdnUrl(look.before, graphqlId),
        after: await ensureShopifyCdnUrl(look.after, graphqlId),
      }))
    );

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
          value: JSON.stringify(cdnLooks),
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
      imagesUploaded: cdnLooks.length,
      savedLooks: cdnLooks,
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

// Preserves 100% original uncompressed image quality
async function optimizeImageForCloud(src: string, _maxDimension?: number, _quality?: number): Promise<string> {
  return src;
}

// 6. Save Homepage Settings globally to Shopify Cloud Database
export async function saveHomepageSettingsToShopify(
  settings: HomepageSettings
): Promise<{ success: boolean; error?: string }> {
  const { domain, adminToken } = getShopifyAdminCredentials();

  try {
    // 1. Auto-upload looks to Shopify CDN so JSON string is crisp and fits Shopify limits
    const cdnLooks = await Promise.all(
      settings.looks.map(async (look) => ({
        ...look,
        before: await ensureShopifyCdnUrl(look.before),
        after: await ensureShopifyCdnUrl(look.after),
      }))
    );

    const payload = {
      ...settings,
      looks: cdnLooks,
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
    const cdnItems = await Promise.all(
      items.map(async (item) => ({
        ...item,
        image: await ensureShopifyCdnUrl(item.image),
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
          value: JSON.stringify(cdnItems),
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
