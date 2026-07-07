import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  root: '.',
  publicDir: 'public',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,svg,png,jpg,jpeg}'],
      },
      manifest: {
        name: 'SB 3019 — IL Digital Asset Tax Campaign',
        short_name: 'SB 3019',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone',
      },
    }),
  ],
  server: {
    port: 5174,
    open: false,
  },
});
