
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '54c0cbad-0dda-41ef-8678-c28f4995a42c-00-pp57plnqeawz.janeway.replit.dev'
    ]
  }
})