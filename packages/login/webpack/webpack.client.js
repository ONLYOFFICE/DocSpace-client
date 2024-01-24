const { merge } = require("webpack-merge");
const path = require("path");
const ModuleFederationPlugin =
  require("webpack").container.ModuleFederationPlugin;
const DefinePlugin = require("webpack").DefinePlugin;
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ExternalTemplateRemotesPlugin = require("external-remotes-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const minifyJson = require("@docspace/shared/utils/minifyJson");
const sharedDeps = require("@docspace/shared/constants/sharedDependencies");

const baseConfig = require("./webpack.base.js");
const runtime = require("../../runtime.json");
const pkg = require("../package.json");
const deps = pkg.dependencies || {};
const dateHash = runtime?.date || "";

for (let dep in sharedDeps) {
  sharedDeps[dep].eager = true;
}

const clientConfig = {
  target: "web",
  entry: {
    client: ["./src/client/index.ts"],
  },

  output: {
    path: path.resolve(process.cwd(), "dist/client"),
    filename: "static/js/[name].[contenthash].bundle.js",
    publicPath: "/login/",
    chunkFilename: "static/js/[id].[contenthash].js",
    assetModuleFilename: (pathData) => {
      //console.log({ pathData });

      let result = pathData.filename
        .substr(pathData.filename.indexOf("public/"))
        .split("/")
        .slice(1);

      result.pop();

      let folder = result.join("/");

      folder += result.length === 0 ? "" : "/";

      return `static/${folder}[name][ext]?hash=[contenthash]`; // `${folder}/[name].[contenthash][ext]`;
    },
  },

  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },

  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          {
            loader: "css-loader",
            options: {
              url: {
                filter: (url, resourcePath) => {
                  // resourcePath - path to css file

                  // Don't handle `/static` urls
                  if (url.startsWith("/static") || url.startsWith("data:")) {
                    return false;
                  }

                  return true;
                },
              },
            },
          },
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.json$/,
        resourceQuery: /url/,
        type: "javascript/auto",
        use: [
          {
            loader: "file-loader",

            options: {
              emitFile: false,
              name: (resourcePath, resourceQuery) => {
                let result = resourcePath
                  .split(`public${path.sep}`)[1]
                  .split(path.sep);

                result.pop();

                let folder = result.join("/");

                folder += result.length === 0 ? "" : "/";

                return `${folder}[name].[ext]?hash=[contenthash]`; // `${folder}/[name].[contenthash][ext]`;
              },
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new ModuleFederationPlugin({
      name: "login",
      filename: "remoteEntry.js",
      remotes: {
        client: "client@/remoteEntry.js",
      },
      exposes: {
        "./login": "./src/client/components/Login.tsx",
        "./codeLogin": "./src/client/components/CodeLogin.tsx",
      },
      shared: { ...sharedDeps, ...deps },
    }),
    new ExternalTemplateRemotesPlugin(),
    new CopyPlugin({
      patterns: [
        {
          context: path.resolve(__dirname, "../public"),
          from: "locales/**/*.json",
          transform: minifyJson,
        },
      ],
    }),
    new WebpackManifestPlugin(),
  ],
};

module.exports = (env, argv) => {
  if (argv.mode === "production") {
    clientConfig.mode = "production";
    clientConfig.optimization = {
      splitChunks: { chunks: "all" },
      minimize: !env.minimize,
      minimizer: [new TerserPlugin()],
    };
  } else {
    clientConfig.mode = "development";
    clientConfig.devtool = "cheap-module-source-map";
  }

  clientConfig.plugins = [
    ...clientConfig.plugins,
    new DefinePlugin({
      IS_DEVELOPMENT: argv.mode !== "production",
      PORT: process.env.PORT || 5011,
      IS_PERSONAL: env.personal || false,
      IS_ROOMS_MODE: env.rooms || false,
      BROWSER_DETECTOR_URL: JSON.stringify(
        `/static/scripts/browserDetector.js?hash=${
          runtime.checksums["browserDetector.js"] || dateHash
        }`
      ),
      CONFIG_URL: JSON.stringify(
        `/static/scripts/config.json?hash=${
          runtime.checksums["config.json"] || dateHash
        }`
      ),
    }),
  ];

  return merge(baseConfig, clientConfig);
};
