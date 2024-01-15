module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "airbnb",
    "airbnb/hooks",
    "airbnb-typescript",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    project: "tsconfig.eslint.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parser: "@typescript-eslint/parser",

  plugins: ["@typescript-eslint", "react"],
  rules: {
    "import/prefer-default-export": "off",
    "import/no-extraneous-dependencies": "off",
    "@typescript-eslint/ban-types": "off",
    "jsx-a11y/label-has-associated-control": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "jsx-a11y/anchor-is-valid": "off",
    "react/react-in-jsx-scope": "off",
    "react/function-component-definition": "off",
    "react/jsx-props-no-spreading": "off",
    "consistent-return": "off",
    "no-param-reassign": "off",
    "no-nested-ternary": "off",
    "prefer-destructuring": "off",
    "no-return-assign": "off",
    // "no-unneeded-ternary": "off",
    "react/require-default-props": "off",
    "jsx-a11y/no-noninteractive-element-interactions": "off",
  },
  ignorePatterns: ["./tsconfig.json", "coverage/**", "storybook-static/**"],
};
