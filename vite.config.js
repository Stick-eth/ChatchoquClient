// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // équivalent à --host 0.0.0.0
    port: 5173,        // facultatif, port par défaut
    strictPort: false  // si le port est occupé, cherche un port libre
  }
});
