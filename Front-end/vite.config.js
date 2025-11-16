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
      host: '0.0.0.0', 
      port: 3000,
      proxy: {
        '/api/auth': {
          target: process.env.VITE_AUTH_URL || 'http://localhost:5001',
          changeOrigin: true,
        },
      
      '/api/ride': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        
      },     
      '/api/user': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/api/marketplace': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/marketplace/, '/api')
      }
    }
  }
})

