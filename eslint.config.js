import js from '@eslint/js';
import jsonc from 'eslint-plugin-jsonc';
import markdown from 'eslint-plugin-markdown';
import globals from 'globals';

// Получаем конфиги для JSON
const jsonConfigs = jsonc.configs['flat/recommended-with-jsonc'];

export default [
  // === JavaScript ===
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },

  // === JSON: вставляем ВСЕ конфиги из jsonc.configs как отдельные объекты ===
  ...jsonConfigs,

  // === Переопределяем правила для JSON (если нужно) ===
  {
    files: ['**/*.json', '**/*.jsonc', '**/*.json5'],
    rules: {
      'jsonc/quote-props': 'off',
      'jsonc/comma-dangle': ['error', 'never'],
    },
  },

  // === Markdown: обработка .md файлов ===
  {
    files: ['**/*.md'],
    plugins: {
      markdown,
    },
    processor: markdown.processors.markdown,
  },

  // === Правила для JS-кода внутри Markdown (```js) ===
  {
    files: ['**/*.md/*.js'],
    rules: {
      'no-alert': 'warn',
      'no-console': 'warn',
    },
  },
];