import * as path from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig(() => ({
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, './src/console/assets'),
      '@pages': path.resolve(__dirname, './src/console/pages'),
      '@config': path.resolve(__dirname, './src/console/config'),
      '@hooks': path.resolve(__dirname, './src/console/hooks'),
      '@API': path.resolve(__dirname, './src/console/API'),
      '@core': path.resolve(__dirname, './src/console/core')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vite.setup.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
      all: false,
      include: ['**/src/**'],
      exclude: ['**/src/console/config/**']
    },

    server: {
      deps: {
        inline: [/@patternfly\/react-styles/]
      }
    },

    deps: {
      optimizer: {
        web: {
          include: [/@patternfly\/.*/, /\.(css|less|sass|scss|styl|stylus|pcss|postcss)$/]
        }
      }
    }
  }
}));
