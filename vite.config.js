import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from "fs"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: { 
    outDir: './src/dist', // Build output directory
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port:5173,
    
    https: {
       key: fs.readFileSync(path.join("/etc/letsencrypt/live/optimalfrequencytrader.com/", 'privkey.pem'), 'utf8'),
      cert: fs.readFileSync(path.join("/etc/letsencrypt/live/optimalfrequencytrader.com/", 'fullchain.pem'), 'utf8')
    }, // Enable HTTPS
    // You can also specify your own cert and key here if needed:
    // https: 
    watch: {
      // Watch additional directories if needed
      ignored: ['node_modules/**', '.git/**'] // Customize as needed
    }
  }
})

