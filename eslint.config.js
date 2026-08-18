import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import i18next from 'eslint-plugin-i18next';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Clean up globals by removing entries with whitespace
const cleanGlobals = Object.fromEntries(
  Object.entries(globals.browser).map(([key, value]) => [key.trim(), value]),
);

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: cleanGlobals,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      i18next: i18next,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-only',
          'jsx-attributes': {
            include: ['label', 'placeholder', 'title', 'alt', 'description'],
          },
          ignore: ['className', 'key', 'id', 'data-', 'aria-', 'type', 'name', 'role', 'as', 'variant', 'size', 'mode'],
        },
      ],
    },
  },
  // Désactive la règle no-literal-string pour les layouts et composants UI (bibliothèque)
  {
    files: ['src/components/layouts/**/*.{ts,tsx}', 'src/components/ui/**/*.{ts,tsx}', 'src/components/**/*.tsx'],
    rules: {
      'i18next/no-literal-string': 'off',
    },
  },
);
