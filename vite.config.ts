import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@immerser/react': resolve(rootDir, 'immerser-react/index.ts'),
      '@dubaua/merge-options': resolve(rootDir, 'node_modules/@dubaua/merge-options/dist/merge-options.min.mjs'),
      '@dubaua/observable': resolve(rootDir, 'node_modules/@dubaua/observable/dist/observable.min.mjs'),
      immerser: resolve(rootDir, '../immerser/src/immerser.ts'),
    },
  },
  server: {
    open: true,
  },
});
