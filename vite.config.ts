import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

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
  build: {
    minify: 'terser',
    terserOptions: {
      keep_classnames: terserReservedNamesPattern,
      keep_fnames: terserReservedNamesPattern,
      mangle: {
        reserved: terserReservedNames,
      },
    },
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'immerser-react.js' : 'immerser-react.cjs'),
    },
    rollupOptions: {
      external: ['classnames', 'immerser', 'react', 'react/jsx-runtime'],
    },
  },
});
