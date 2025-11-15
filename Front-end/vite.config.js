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
      // Requests to /api/auth go to the auth service (Port 5001)
      '/api/auth': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, '')
      },
      // Requests to /api/ride go to the ride service (Port 5000)
      '/api/ride': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ride/, '')
      },
      // Requests to /api/user (for profiles) go to the auth service
      '/api/user': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/user/, '')
      },
      // Requests to /api/marketplace go to the new service (Port 5002)
      '/api/marketplace': {
        target: 'http://localhost:5002', // <-- Port for your marketplace backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/marketplace/, '')
      }
    }
  }
})

