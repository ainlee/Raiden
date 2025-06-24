import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
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
    port: 5500,
    hmr: true,
    open: '/test/'
  }
})