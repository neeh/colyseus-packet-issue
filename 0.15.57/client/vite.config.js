import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5443,
    strictPort: true,
    https: {
      key: fs.readFileSync(path.join(import.meta.dirname, '../../certificates/dev_key.pem')),
      cert: fs.readFileSync(path.join(import.meta.dirname, '../../certificates/dev.pem'))
    }
  }
});
