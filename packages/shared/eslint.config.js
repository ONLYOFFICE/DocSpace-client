const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const jsxA11y = require("eslint-plugin-jsx-a11y");
const importPlugin = require("eslint-plugin-import");
const prettier = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.eslint.json",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
      prettier,
    },
    rules: {
      // Custom rules
      "import/prefer-default-export": "off",
      "import/no-extraneous-dependencies": "off",
      "@typescript-eslint/ban-types": "off",
      "jsx-a11y/label-has-associated-control": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "jsx-a11y/anchor-is-valid": "off",
      "jsx-a11y/tabindex-no-positive": "off",
      "jsx-a11y/no-autofocus": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
      "jsx-a11y/mouse-events-have-key-events": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-props-no-spreading": "off",
      "consistent-return": "off",
      "no-nested-ternary": "off",
      "no-return-assign": "off",
      "react/require-default-props": "off",
      "react/function-component-definition": "off",
      "no-console": "off",
      "no-useless-escape": "off",
      "no-param-reassign": "off",
      "prefer-destructuring": "off",
      "@typescript-eslint/no-duplicate-enum-values": "off",
      "@typescript-eslint/only-throw-error": ["error"],
      "@typescript-eslint/no-loop-func": "error",
      "@typescript-eslint/no-use-before-define": [
        "error",
        { functions: false },
      ],
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
      "react/jsx-filename-extension": [
        1,
        { extensions: [".js", ".ts", ".jsx", ".tsx"] },
      ],
      "lines-between-class-members": [
        "error",
        "always",
        { exceptAfterSingleLine: true },
      ],
      "react/jsx-no-leaked-render": ["error", { validStrategies: ["ternary"] }],
      "react/jsx-max-depth": ["error", { max: 10 }],
      "react/jsx-key": [
        "error",
        {
          checkFragmentShorthand: true,
          checkKeyMustBeforeSpread: true,
          warnOnDuplicates: true,
        },
      ],
      "react/jsx-no-useless-fragment": "warn",
      "react/jsx-curly-brace-presence": "warn",
      "react/prefer-stateless-function": "error",
      "react/no-unused-prop-types": "error",
      "react/jsx-pascal-case": "error",
      "react/no-danger": "error",
      "react/no-danger-with-children": "error",
      "react/no-unstable-nested-components": ["error", { allowAsProps: true }],
      "react/no-this-in-sfc": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.{js,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        sourceType: "script",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    ignores: [
      "./tsconfig.json",
      "./eslint.config.js",
      "node_modules/**",
      "storybook-static/**",
      "coverage/**",
      "storybook-static/**",
      "components/scrollbar/custom-scrollbar/**",
    ],
  },
];
