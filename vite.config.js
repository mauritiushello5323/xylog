import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // base = GitHub repo name (must match exactly)
  // If you name your repo something other than "xylog", change this line
  base: '/xylog/',
})
