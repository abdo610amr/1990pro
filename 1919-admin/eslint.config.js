import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Form dialogs intentionally synchronize editable drafts when API data changes.
      'react-hooks/set-state-in-effect': 'off',
      // Shared shadcn-style modules export component variants alongside components.
      'react-refresh/only-export-components': 'off',
      // useAsyncData accepts caller-supplied dependency arrays by design.
      'react-hooks/use-memo': 'off',
    },
  },
])
