// backend/eslint.config.js
const js = require('@eslint/js');
const importPlugin = require('eslint-plugin-import');
const nPlugin = require('eslint-plugin-n'); // πρώην eslint-plugin-node
const prettierConfig = require('eslint-config-prettier');
const globals = require('globals');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  { ignores: ['node_modules/**', 'coverage/**', 'dist/**', 'scripts/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    plugins: { import: importPlugin, n: nPlugin },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'n/no-missing-require': 'off',
      'n/no-unpublished-require': 'off',
      'n/shebang': 'off',
    },
  },
  {
    files: ['**/*.test.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
  },
  prettierConfig,
];
