
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '9d863368-79fe-47ca-b4a3-db1001a090f2-00-3h0mpiin5i1pn.janeway.replit.dev'
    ]
  }
})