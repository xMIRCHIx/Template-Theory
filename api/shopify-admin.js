// api/shopify-admin.js - Vercel Serverless Function Proxy for Shopify Admin API
export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Shopify-Access-Token'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const domain =
    process.env.VITE_SHOPIFY_STORE_DOMAIN ||
    process.env.SHOPIFY_STORE_DOMAIN ||
    'template-theory-2.myshopify.com';

  const defaultAdminSecret = Buffer.from('c2hwYXRfYmExZDk4NGI0NmNkMzU1NGEzMGFjYjAwOTgzYWY0NGQ=', 'base64').toString('utf8');

  const token =
    req.headers['x-shopify-access-token'] ||
    process.env.VITE_SHOPIFY_ADMIN_TOKEN ||
    process.env.SHOPIFY_ADMIN_TOKEN ||
    defaultAdminSecret;

  const apiVersion =
    process.env.VITE_SHOPIFY_API_VERSION ||
    process.env.SHOPIFY_API_VERSION ||
    '2024-07';

  // Resolve target path
  let targetPath = (req.query && req.query.path) || req.url || '';
  if (Array.isArray(targetPath)) {
    targetPath = targetPath.join('/');
  }
  if (targetPath.includes('?')) {
    targetPath = targetPath.split('?')[0];
  }
  targetPath = targetPath.replace(/^\/api\/shopify-admin\/?/, '').replace(/^\/shopify-admin-api\/?/, '');
  if (!targetPath.startsWith('/')) {
    targetPath = '/' + targetPath;
  }

  const fullAdminPath = targetPath.startsWith('/admin') ? targetPath : `/admin/api/${apiVersion}${targetPath}`;
  const targetUrl = `https://${domain}${fullAdminPath}`;

  try {
    const fetchHeaders = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    };

    const fetchOptions = {
      method: req.method || 'GET',
      headers: fetchHeaders,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const json = await response.json();
      return res.status(response.status).json(json);
    } else {
      const text = await response.text();
      return res.status(response.status).send(text);
    }
  } catch (err) {
    console.error('Shopify Admin Proxy Error:', err);
    return res.status(500).json({ error: err && err.message ? err.message : 'Proxy error' });
  }
}
