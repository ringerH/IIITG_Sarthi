import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  server: { 
    port: 3000,
    host: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api/auth': {
        target: process.env.VITE_AUTH_URL || 'http://localhost:5001',
        changeOrigin: true,
      },
      '/api/user': {
        target: process.env.VITE_AUTH_URL || 'http://localhost:5001',
        changeOrigin: true,
      },
      '/api/ride': {
        target: process.env.VITE_RIDE_URL || 'http://localhost:5003',
        changeOrigin: true,
      },
      '/api/listings': {
        target: process.env.VITE_MARKETPLACE_URL || 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/api/marketplace': {
        target: process.env.VITE_MARKETPLACE_URL || 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/marketplace/, '/api')
      }
    }
  }
})