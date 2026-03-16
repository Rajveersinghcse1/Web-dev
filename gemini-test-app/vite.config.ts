import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env': {},
    'process.browser': true,
  },
  resolve: {
    alias: {
      // Prevent Next.js server-side imports
      'next/headers': 'react',
      'next/navigation': 'react',
    },
  },
  optimizeDeps: {
    exclude: [],
  },
})
