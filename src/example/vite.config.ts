import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const exampleDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(exampleDir, '../..');

export default defineConfig({
  plugins: [react()],
  root: exampleDir,
  publicDir: false,
  build: {
    outDir: resolve(rootDir, 'docs'),
    emptyOutDir: true,
  },
  server: {
    open: true,
  },
});
