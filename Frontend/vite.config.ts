/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Bind IPv4 explicitly: on some Windows setups Vite otherwise listens
    // only on ::1 and browsers cannot reach http://localhost:5173.
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      // During development, forward API calls to the backend server.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.ts',
  },
})