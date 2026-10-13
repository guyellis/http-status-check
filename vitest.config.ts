import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      exclude: ['sitelists/*'],
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      thresholds: {
        branches: 76,
        functions: 91,
        lines: 92,
        statements: 92,
      },
    },
    environment: 'node',
    exclude: [...configDefaults.exclude, 'test/setup.ts'],
    globals: true,
    include: ['test/**/*.{js,ts}', '**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    setupFiles: ['./test/setup.ts'],
  },
});
