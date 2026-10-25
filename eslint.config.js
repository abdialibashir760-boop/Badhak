import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {ignores: ['tests/e2e.cjs', 'out', 'node_modules', 'dist', 'public']},
  {languageOptions: {globals: {process: 'readonly', console: 'readonly', URL: 'readonly', Buffer: 'readonly'}}},
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {'react-hooks': reactHooks},
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
    },
  },
);
