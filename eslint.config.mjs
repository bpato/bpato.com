import eslintPluginAstro from "eslint-plugin-astro";
import eslintConfigPrettier from "eslint-config-prettier";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  ...eslintPluginAstro.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      "no-var": "error",
    },
  },
  {
    ignores: ["dist/", "node_modules/", ".astro/", "*.config.mjs"],
  },
];
