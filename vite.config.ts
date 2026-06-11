import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        // Bind all interfaces (IPv4 + IPv6); 'localhost' alone bound only [::1],
        // so http://127.0.0.1 / localhost refused connections in the browser.
        host: true,
      },
      plugins: [react()],
      build: {
        outDir: 'dist',
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
