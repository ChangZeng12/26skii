import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // 相对路径：部署目标（GitHub Pages / Vercel）未定，见 agents.md §14
  base: './',
  plugins: [react()],
  // MapLibre v6 以 ES module worker 方式加载 worker（见 src/lib/maplibre-setup.ts）
  worker: { format: 'es' },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
