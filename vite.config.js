import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Build with relative asset paths so the app can be served from a WordPress plugin subfolder.
  base: './',
})
