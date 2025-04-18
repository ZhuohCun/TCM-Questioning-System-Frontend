import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Icons from 'unplugin-icons/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Icons({
      compiler: 'vue3',
      autoInstall: true,
      scale: 1.2,
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    hmr: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8089',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const url = new URL(req.url, 'http://localhost');
            const token = url.searchParams.get('Authorization');
            
            if (token) {
              proxyReq.setHeader('Authorization', token);
              url.searchParams.delete('Authorization');
              req.url = url.pathname + url.search;
            }

            if (req.headers['accept'] === 'text/event-stream') {
              proxyReq.setHeader('Connection', 'keep-alive');
              proxyReq.setHeader('Cache-Control', 'no-cache');
              proxyReq.setHeader('Content-Type', 'text/event-stream');
            }
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            if (req.headers['accept'] === 'text/event-stream') {
              proxyRes.headers['Connection'] = 'keep-alive';
              proxyRes.headers['Cache-Control'] = 'no-cache';
              proxyRes.headers['Content-Type'] = 'text/event-stream';
              proxyRes.headers['Transfer-Encoding'] = 'chunked';
              
              res.setHeader('X-Accel-Buffering', 'no');
            }
          });
        }
      }
    }
  }
})
