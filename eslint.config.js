import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  {
    rules: {
      semi: 'off',
      'no-unreachable': 'error', // Already in ts, but perhaps it catches more cases
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off', // Often works incorrectly
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
