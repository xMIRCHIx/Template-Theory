import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/shopify-admin-api': {
        target: 'https://template-theory-2.myshopify.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/shopify-admin-api/, ''),
      },
    },
  },
});
