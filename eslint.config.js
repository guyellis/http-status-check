import pluginJs from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import perfectionist from 'eslint-plugin-perfectionist';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  eslintPluginPrettierRecommended,
  {
    ignores: ['coverage/', 'dist/', 'node_modules/'],
  },
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: { ...globals.node } } },
  {
    ...pluginJs.configs.recommended,
    plugins: {
      '@stylistic': stylistic,
      import: importX,
      perfectionist,
    },
    rules: {
      '@stylistic/quotes': ['error', 'single'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'comma-dangle': ['error', 'always-multiline'],
      curly: ['error', 'all'],
      'eol-last': ['error', 'always'],
      eqeqeq: ['error'],
      'import/order': [
        'error',
        {
          alphabetize: {
            caseInsensitive: true,
            order: 'asc',
          },
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
      'perfectionist/sort-objects': [
        'error',
        {
          ignoreCase: false,
          order: 'asc',
          type: 'alphabetical',
        },
      ],
      semi: ['error'],
    },
  },
  {
    files: ['test/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
  },
  {
    files: ['lib/outAdapters/consoleAdapter.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  ...tseslint.configs.recommended,
  prettierConfig,
];
