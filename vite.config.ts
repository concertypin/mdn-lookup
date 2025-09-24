import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist-worker',
    lib: {
      entry: 'src/worker.ts',
      formats: ['es'],
      fileName: 'worker',
    },
    rollupOptions: {
      external: [],
    },
    minify: false,
    sourcemap: true,
  },
  define: {
    global: 'globalThis',
  },
});