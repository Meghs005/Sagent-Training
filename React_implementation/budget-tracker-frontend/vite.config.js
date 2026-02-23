import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    proxy: {
      '/users':    'http://localhost:8080',
      '/income':   'http://localhost:8080',
      '/expenses': 'http://localhost:8080',
      '/budget':   'http://localhost:8080',
      '/goals':    'http://localhost:8080',
      '/accounts': 'http://localhost:8080',
    }
  }
})
