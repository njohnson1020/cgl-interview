import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Regular Vitest configuration options
  },
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/app'),
    },
  },
});
