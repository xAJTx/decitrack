import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/decitrack/',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    sourcemap: false
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
