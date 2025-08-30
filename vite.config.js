
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'd517ccd3-e7ec-47e5-805d-f032ad51d0fe-00-1zys9ivzly5aa.picard.replit.dev'
    ]
  }
})