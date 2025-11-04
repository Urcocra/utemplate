import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'server', // 改为 server 以支持 API 路由
  integrations: [tailwind(), react()],
  server: {
    port: 3000,
    host: true
  },
  // 如果需要部署到静态站点，可以使用混合模式
  // output: 'hybrid',
});