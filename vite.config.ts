import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function shopifyAdminDevProxyPlugin(): Plugin {
  let cachedToken: string | null = null;
  let tokenExpiresAt = 0;

  async function getToken(clientId: string, clientSecret: string, domain: string) {
    if (cachedToken && Date.now() < tokenExpiresAt) {
      return cachedToken;
    }
    if (!clientId || !clientSecret) return null;
    try {
      const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
        }),
      });
      const data = await res.json();
      if (data.access_token) {
        cachedToken = data.access_token;
        tokenExpiresAt = Date.now() + ((data.expires_in || 86400) - 300) * 1000;
        return cachedToken;
      }
    } catch (err) {
      console.error('Failed to get Shopify token in Vite dev proxy:', err);
    }
    return null;
  }

  return {
    name: 'shopify-admin-dev-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/shopify-admin-api')) {
          return next();
        }

        const env = loadEnv('development', process.cwd(), '');
        const domain = env.VITE_SHOPIFY_STORE_DOMAIN || 'template-theory-2.myshopify.com';
        const clientId = env.VITE_SHOPIFY_CLIENT_ID;
        const clientSecret = env.VITE_SHOPIFY_CLIENT_SECRET;
        const token =
          (await getToken(clientId, clientSecret, domain)) ||
          env.VITE_SHOPIFY_ADMIN_TOKEN;

        let targetPath = url.replace(/^\/shopify-admin-api\/?/, '');
        if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;
        const fullAdminPath = targetPath.startsWith('/admin') ? targetPath : `/admin/api/2024-07${targetPath}`;
        const targetUrl = `https://${domain}${fullAdminPath}`;

        try {
          const fetchHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (token) {
            fetchHeaders['X-Shopify-Access-Token'] = token;
          }

          let bodyData: any = undefined;
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            bodyData = Buffer.concat(chunks);
          }

          const response = await fetch(targetUrl, {
            method: req.method || 'GET',
            headers: fetchHeaders,
            body: bodyData,
          });

          res.statusCode = response.status;
          response.headers.forEach((val, key) => {
            const lKey = key.toLowerCase();
            if (lKey !== 'transfer-encoding' && lKey !== 'content-encoding' && lKey !== 'content-length') {
              res.setHeader(key, val);
            }
          });

          const resBuffer = await response.arrayBuffer();
          res.end(Buffer.from(resBuffer));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err?.message || 'Proxy error' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), shopifyAdminDevProxyPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
