
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '68050ffc-18b0-42cd-bd1c-7ec40efe541d-00-316fv9gm0b16p.janeway.replit.dev_test'
    ]
  }
})