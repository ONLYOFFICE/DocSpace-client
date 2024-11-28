module.exports = {
  presets: [
    "@babel/preset-env",
    "@babel/preset-typescript",
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
  plugins: [
    ["@babel/plugin-proposal-class-properties"],
    ["@babel/plugin-proposal-export-default-from"],
    ["@babel/plugin-transform-runtime"],
    ["babel-plugin-styled-components", {
      displayName: false,
      pure: true
    }]
  ],
};
