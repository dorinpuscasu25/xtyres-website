import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const vitePort = Number(process.env.VITE_PORT ?? '5174')
const viteHost = process.env.VITE_HOST ?? '0.0.0.0'
const viteHmrHost = process.env.VITE_HMR_HOST ?? 'localhost'
const viteUsePolling = process.env.VITE_USE_POLLING === 'true'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: viteHost,
    port: vitePort,
    strictPort: true,
    allowedHosts: true,
    hmr: {
      host: viteHmrHost,
      clientPort: vitePort,
    },
    watch: viteUsePolling
      ? {
          usePolling: true,
          interval: 300,
        }
      : undefined,
  },
  preview: {
    host: viteHost,
    port: vitePort,
    strictPort: true,
  },
})
