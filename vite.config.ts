// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/rpc': {
        target: 'http://165.227.185.13:8547', // Digital Ocean
        //target: 'http://127.0.0.1:8547', // Localhost
        changeOrigin: true, // Sets Host header to match target
        rewrite: (path) => path.replace(/^\/rpc/, ''), // Remove /rpc prefix
        secure: false, // Allow non-HTTPS for local dev
        configure: (proxy, _options) => {
          proxy.on('error', (err) => console.error('Proxy error:', err));
          proxy.on('proxyReq', (proxyReq) => {
            console.log('Proxying to:', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes) => {
            console.log('Response from target:', proxyRes.statusCode);
          });
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src', // No need for path.resolve()
    },
  },
});

