import { dirname, join } from "path";
import remarkGfm from "remark-gfm";

/** @type { import('@storybook/react-webpack5').StorybookConfig } */
export default {
  stories: [
    // "../all/all.stories.js",
    // default page
    "../**/*.stories.@(js|jsx|ts|tsx|mdx)", //"../**/*.stories.@(js|mdx)",
  ],

  staticDirs: ["../../../public", "../__mocks__/storybook/mockServiceWorker"],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-actions"),
    getAbsolutePath("@storybook/addon-controls"),
    getAbsolutePath("@storybook/addon-viewport"),
    getAbsolutePath("@storybook/addon-designs"),
    {
      name: "@storybook/addon-docs",
      options: {
        configureJSX: true,
        babelOptions: {
          plugins: [
            [
              "@babel/plugin-transform-private-property-in-object",
              {
                loose: true,
              },
            ],
          ],
        },
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    getAbsolutePath("storybook-dark-mode"),
    getAbsolutePath("@storybook/addon-webpack5-compiler-babel"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-webpack5"),
    options: {},
  },
  docs: {},

  babel: async (options) => {
    const presets = Array.isArray(options.presets) ? [...options.presets] : [];
    presets.push([
      "@babel/preset-react",
      {
        runtime: "automatic",
      },
    ]);

    return {
      ...options,
      presets,
    };
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
