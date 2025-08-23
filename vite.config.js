
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '6006221a-5a98-4bed-8e7d-333f02894ab7-00-3evc07yycemn9.kirk.replit.dev'
    ]
  }
})