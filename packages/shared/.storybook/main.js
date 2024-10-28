import { dirname, join } from "path";
module.exports = {
  stories: [
    // "../all/all.stories.js",
    // default page
    "../**/*.stories.@(js|jsx|ts|tsx|mdx)", //"../**/*.stories.@(js|mdx)",
  ],

  staticDirs: ["../../../public"],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-actions"),
    getAbsolutePath("@storybook/addon-controls"),
    getAbsolutePath("@storybook/addon-viewport"),
    getAbsolutePath("@storybook/addon-contexts"),
    getAbsolutePath("@react-theming/storybook-addon"),
    getAbsolutePath("@storybook/addon-designs"),
    {
      name: "@storybook/addon-docs",
      options: {
        configureJSX: true,
        babelOptions: {
          plugins: [
            [
              "@babel/plugin-proposal-private-property-in-object",
              {
                loose: true,
              },
            ],
          ],
        },
      },
    },
    getAbsolutePath("@storybook/addon-mdx-gfm"),
    getAbsolutePath("storybook-dark-mode"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-webpack5"),
    options: {},
  },
  docs: {
    autodocs: true,
  },
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: false,
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
};

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}
