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
        target: 'http://117.72.99.11:8080',
        changeOrigin: true,
        secure: false, // 忽略 SSL 证书验证
        ws: true, // 开启 WebSocket 代理
      },
      '/cos-proxy': {
        target: 'https://test-1377490072.cos.ap-guangzhou.myqcloud.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cos-proxy/, ''),
      },
    },
  },
});
