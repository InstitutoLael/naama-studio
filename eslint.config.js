import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node, ...globals.serviceworker },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: '18.3' } },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/prop-types': 'off',
      // React 18 necesita «fetchpriority» en minúscula para pasarlo tal cual a la etiqueta <img>.
      'react/no-unknown-property': ['error', { ignore: ['fetchpriority'] }],
      'react/no-unescaped-entities': 'off',
      'no-unused-vars': ['warn', { varsIgnorePattern: '^(_|React$)', argsIgnorePattern: '^_' }],
    },
  },
];
