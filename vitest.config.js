import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.js', '**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: ['sitelists/*'],
      thresholds: {
        statements: 79,
        lines: 78,
        branches: 74,
        functions: 81
      }
    }
  }
});
