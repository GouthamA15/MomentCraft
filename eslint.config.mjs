import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [".temp_ag_kit/**", ".agent/**", "node_modules/**", ".next/**"],
  },
  {
    files: ["src/templates/wedding/template-1/**/*.tsx"],
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default config;
