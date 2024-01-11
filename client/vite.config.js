import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  server:{
    host: '192.168.1.101'
  },
  plugins: [react()],
})
