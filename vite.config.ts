
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    host: true, // Telefondan test ederken yerel IP ile erişim için gerekli
  },
  // Telegram Web Apps often run in a subpath or verify root access differently.
  // './' ensures assets are loaded relative to index.html
  base: './', 
});
