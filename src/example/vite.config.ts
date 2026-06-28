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
  resolve: {
    alias: {
      '@immerser/react': resolve(rootDir, 'src/index.ts'),
      '@dubaua/merge-options': resolve(rootDir, 'node_modules/@dubaua/merge-options/dist/merge-options.min.mjs'),
      '@dubaua/observable': resolve(rootDir, 'node_modules/@dubaua/observable/dist/observable.min.mjs'),
      immerser: resolve(rootDir, '../immerser/src/immerser.ts'),
    },
  },
  build: {
    outDir: resolve(rootDir, 'docs'),
    emptyOutDir: true,
  },
  server: {
    open: true,
  },
});
