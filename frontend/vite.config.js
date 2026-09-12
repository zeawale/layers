import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // В докере файловые события до контейнера не всегда доходят,
    // поэтому просим Vite опрашивать файлы вручную.
    watch: { usePolling: true },
  },
})
