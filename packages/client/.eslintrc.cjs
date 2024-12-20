const path = require("path");

module.exports = {
  extends: "../shared/.eslintrc.cjs",
  parserOptions: {
    project: "tsconfig.eslint.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },

  ignorePatterns: [
    "./tsconfig.json",
    "coverage/**",
    "storybook-static/**",
    "*.js",
  ],

  settings: {
    "import/resolver": {
      webpack: {
        config: {
          resolve: {
            extensions: [".jsx", ".js", ".tsx", ".ts", ".json"],
            alias: {
              PUBLIC_DIR: path.resolve(__dirname, "../../public"),
              ASSETS_DIR: path.resolve(__dirname, "./public"),
              SRC_DIR: path.resolve(__dirname, "./src"),
              PACKAGE_FILE: path.resolve(__dirname, "package.json"),
              COMMON_DIR: path.resolve(__dirname, "../common"),
            },
          },
        },
      },
    },
  },
};
