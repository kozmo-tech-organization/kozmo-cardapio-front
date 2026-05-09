import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@repo/schemas': new URL('../../packages/schemas/src/index.ts', import.meta.url).pathname,
      '@repo/ui': new URL('../../packages/ui/src/index.ts', import.meta.url).pathname,
      '@repo/server': new URL('../../packages/server/src/index.ts', import.meta.url).pathname,
      '@repo/queries': new URL('../../packages/queries/src/index.ts', import.meta.url).pathname,
      '@repo/features': new URL('../../packages/features/src/index.ts', import.meta.url).pathname,
    },
  },
  server: {
    port: 5173,
  },
})
