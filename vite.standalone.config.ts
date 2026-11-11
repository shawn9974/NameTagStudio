import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Builds the whole app into one HTML file that opens directly from disk (no server needed).
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'standalone',
  },
});
