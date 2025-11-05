import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: './src/index.ts',
      output: {
        format: 'es',
        entryFileNames: '[name].mjs',
      },
    },
    outDir: 'dist',
    minify: true,
  },
})
