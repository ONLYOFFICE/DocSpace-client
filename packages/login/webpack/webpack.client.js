// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
const BannerPlugin = require("webpack").BannerPlugin;

const minifyJson = require("@docspace/shared/utils/minifyJson");
const sharedDeps = require("@docspace/shared/constants/sharedDependencies");

const baseConfig = require("./webpack.base.js");
const runtime = require("../../runtime.json");
const pkg = require("../package.json");
const deps = pkg.dependencies || {};
const version = pkg.version;
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

const getBuildDate = () => {
  const timeElapsed = Date.now();
  const today = new Date(timeElapsed);
  return JSON.stringify(today.toISOString().split(".")[0] + "Z");
};

const getBuildYear = () => {
  const timeElapsed = Date.now();
  const today = new Date(timeElapsed);
  return today.getFullYear();
};

module.exports = (env, argv) => {
  if (argv.mode === "production") {
    clientConfig.devtool = "source-map";
    clientConfig.mode = "production";
    clientConfig.optimization = {
      splitChunks: { chunks: "all" },
      minimize: !env.minimize,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: /\*\s*\(c\)\s+Copyright\s+Ascensio\s+System\s+SIA/i,
            },
          },
          extractComments: false,
        }),
      ],
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
    new BannerPlugin({
      raw: true,
      banner: `/*
* (c) Copyright Ascensio System SIA 2009-${getBuildYear()}. All rights reserved
*
* https://www.onlyoffice.com/
*
* Version: ${version} (build: ${getBuildDate()})
*/`,
    }),
  ];

  return merge(baseConfig, clientConfig);
};
