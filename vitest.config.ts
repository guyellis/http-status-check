import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      exclude: ['sitelists/*'],
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
    environment: 'node',
    exclude: [...configDefaults.exclude, 'test/setup.ts'],
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
});
