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
    "jsx-a11y/label-has-associated-control": "off",
    "consistent-return": "off",
    "@typescript-eslint/ban-types": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "react/react-in-jsx-scope": "off",
    "no-param-reassign": "off",
    "react/jsx-props-no-spreading": "off",
    // "no-unneeded-ternary": "off",
    "no-nested-ternary": "off",
    "prefer-destructuring": "off",
    "react/function-component-definition": "off",
  },
  ignorePatterns: ["./tsconfig.json", "coverage/**"],
};
