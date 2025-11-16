import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
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
    open: true,
    proxy: {
      // Requests to /api/auth go to the auth service
      '/api/auth': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        // NO REWRITE NEEDED
      },
      // Requests to /api/ride go to the ride service
      '/api/ride': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // NO REWRITE NEEDED
      },
      // Requests to /api/user (for profiles) go to the auth service
      '/api/user': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        // NO REWRITE NEEDED
      },
      // Requests to /api/marketplace go to the new service
      '/api/marketplace': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/marketplace/, '/api')
      }
    }
    // ------------------------------------
  }
})

