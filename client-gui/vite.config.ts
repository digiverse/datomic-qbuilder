import { fileURLToPath, URL } from 'url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

const env = loadEnv('dev', process.cwd())
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: 'src/quasar-variables.sass',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: env.VITE_API_HOST || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  test: {
    globals: false,
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
  },
})
