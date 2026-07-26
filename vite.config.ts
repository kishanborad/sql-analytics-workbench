import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/sql-analytics-workbench/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'duckdb': ['@duckdb/duckdb-wasm'],
        },
      },
    },
    chunkSizeWarningLimit: 2000,
  },
});
