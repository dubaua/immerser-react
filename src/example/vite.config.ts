import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const exampleDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(exampleDir, '../..');

const terserReservedNames = [
  'Immerser',
  'ImmerserDomController',
  'ImmerserMarkupController',
  'ImmerserEngine',
  'ImmerserProvider',
  'ImmerserLayer',
  'ImmerserPager',
  'ImmerserSolid',
  'ImmerserSynchroLink',
];

const terserReservedNamesPattern = new RegExp(`^(${terserReservedNames.join('|')})$`);

export default defineConfig({
  plugins: [react()],
  root: exampleDir,
  publicDir: false,
  build: {
    minify: 'terser',
    terserOptions: {
      keep_classnames: terserReservedNamesPattern,
      keep_fnames: terserReservedNamesPattern,
      mangle: {
        reserved: terserReservedNames,
      },
    },
    outDir: resolve(rootDir, 'docs'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
  server: {
    open: true,
  },
});
