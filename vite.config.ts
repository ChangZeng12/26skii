import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages 项目站点位于仓库名子路径，JS、头像与地图 worker 共用此前缀。
  base: '/26skii/',
  plugins: [react()],
  // MapLibre v6 以 ES module worker 方式加载 worker（见 src/lib/maplibre-setup.ts）
  worker: { format: 'es' },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
