// eslint.config.js for ESLint v9 (flat config)
const js = require('@eslint/js');
const importPlugin = require('eslint-plugin-import');
const nPlugin = require('eslint-plugin-n');
const prettierConfig = require('eslint-config-prettier');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**', 'coverage/**', 'scripts/**', 'dist/**'],
    languageOptions: { ecmaVersion: 2021, sourceType: 'script' },
    plugins: { import: importPlugin, n: nPlugin },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
  prettierConfig,
];
