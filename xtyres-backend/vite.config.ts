import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

const vitePort = Number(process.env.VITE_PORT ?? '5173');
const viteHost = process.env.VITE_HOST ?? '0.0.0.0';
const viteHmrHost = process.env.VITE_HMR_HOST ?? 'localhost';
const viteUsePolling = process.env.VITE_USE_POLLING === 'true';
const viteOrigin = process.env.VITE_DEV_SERVER_URL;

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    server: {
        host: viteHost,
        port: vitePort,
        strictPort: true,
        origin: viteOrigin,
        cors: true,
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
});
