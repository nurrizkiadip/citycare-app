import globals from 'globals';
import pluginJs from '@eslint/js';
import daStyle from 'eslint-config-dicodingacademy';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  pluginJs.configs.recommended,

  // Dicoding Academy Style Guide
  daStyle,

  // Custom rules
  {
    rules: {
      'space-infix-ops': ['error'],
      'brace-style': ['error', '1tbs'],
      'space-before-blocks': ['error', 'always'],
      'no-use-before-define': 'error',
      'constructor-super': 'error',
      'no-var': 'warn',
      'no-unreachable': 'warn',
      'no-extra-boolean-cast': 'warn',
      'no-duplicate-imports': 'off',
    },
  },
];
