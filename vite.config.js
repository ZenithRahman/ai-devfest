import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          pdflib: ['pdf-lib'],
          vendor: ['react', 'react-dom', 'lucide-react']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
