import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
        "script-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
        "connect-src * 'unsafe-inline'",
        "img-src * data: blob:",
        "frame-src *",
        "style-src * 'unsafe-inline'",
      ].join('; '),
    },
  },
})

