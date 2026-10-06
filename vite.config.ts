import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths: the same build works on GitHub Pages under any
  // repository name, on any static host, or from a sub-folder. The starter
  // hard-coded base '/Salim-Saay/' (TD-09). HashRouter needs no server rewrites.
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    outDir: 'build',
  },
  server: {
    port: 3000,
    open: true,
  },
});
