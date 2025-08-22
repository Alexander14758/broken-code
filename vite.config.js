
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'a70d9dda-95f8-4605-af27-7d95b5bd7791-00-1us1c9aodhhp5.picard.replit.dev'
    ]
  }
})