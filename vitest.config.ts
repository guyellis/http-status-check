import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['sitelists/*'],
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      thresholds: {
        branches: 74,
        functions: 81,
        lines: 78,
        statements: 79,
      },
    },
    environment: 'node',
    globals: true,
    include: ['test/**/*.{js,ts}', '**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
});
