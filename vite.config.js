import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: './src/dist', // Build output directory
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port:5173,
    watch: {
      // Watch additional directories if needed
      ignored: ['node_modules/**', '.git/**'] // Customize as needed
    }
  }
})
