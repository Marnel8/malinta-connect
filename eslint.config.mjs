import js from "@eslint/js"
import { FlatCompat } from "@eslint/eslintrc"
import reactHooks from "eslint-plugin-react-hooks"
import tseslint from "typescript-eslint"

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

export default [
  {
    ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
  },
  ...compat.extends("next/core-web-vitals"),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
]

