import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    {
      name: 'react-jsx',
      transform(code, id) {
        if (id.endsWith('.jsx') || id.endsWith('.tsx')) {
          return {
            code: code.replace(/React\.createElement/g, 'h'),
            map: null
          }
        }
      }
    }
  ],
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
    open: true,
    port: 5173
  },
  preview: {
    host: '0.0.0.0'
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})