module.exports = {
  extends: "../shared/.eslintrc.cjs",
  parserOptions: {
    project: "tsconfig.eslint.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },

  ignorePatterns: ["./tsconfig.json", "coverage/**", "storybook-static/**"],
};
