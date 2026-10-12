import { builtinModules } from 'module';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import * as packageJson from './package.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'index.ts'),
        'lib/inAdapters/fileAdapter': resolve(__dirname, 'lib/inAdapters/fileAdapter.ts'),
        'lib/manager': resolve(__dirname, 'lib/manager.ts'),
        'lib/outAdapters/consoleAdapter': resolve(__dirname, 'lib/outAdapters/consoleAdapter.ts'),
        'lib/outAdapters/emailAdapter': resolve(__dirname, 'lib/outAdapters/emailAdapter.ts'),
        'lib/outAdapters/emailSampleData': resolve(__dirname, 'lib/outAdapters/emailSampleData.ts'),
        'lib/types': resolve(__dirname, 'lib/types.ts'),
        'lib/uriCheck': resolve(__dirname, 'lib/uriCheck.ts'),
        'sitelists/alexa100': resolve(__dirname, 'sitelists/alexa100.ts'),
        'sitelists/samplesites': resolve(__dirname, 'sitelists/samplesites.ts'),
      },
      formats: ['es'],
    },
    outDir: 'dist',
    rollupOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        ...Object.keys(packageJson.dependencies || {}),
        ...Object.keys(packageJson.devDependencies || {}),
      ],
      output: {
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js',
      },
    },
    ssr: true,
  },
});
