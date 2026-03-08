import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://frp-ski.com:46285',
        changeOrigin: true,
        secure: false, // 忽略 SSL 证书验证
        ws: true, // 开启 WebSocket 代理
      },
    },
  },
});
