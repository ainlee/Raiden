import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        test: resolve(__dirname, 'test/index.html')
      },
      preserveEntrySignatures: 'strict'
    }
  },
  server: {
    hmr: true,
    open: '/',
    port: 5173
  },
  preview: {
    host: '0.0.0.0'
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  }
})