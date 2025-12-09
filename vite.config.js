import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Копировать .htaccess в dist
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})

