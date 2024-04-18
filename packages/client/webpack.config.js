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

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin =
  require("webpack").container.ModuleFederationPlugin;
const DefinePlugin = require("webpack").DefinePlugin;
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const BannerPlugin = require("webpack").BannerPlugin;

const ExternalTemplateRemotesPlugin = require("external-remotes-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const minifyJson = require("@docspace/shared/utils/minifyJson");

const sharedDeps = require("@docspace/shared/constants/sharedDependencies");
//const fs = require("fs");
//const { readdir } = require("fs").promises;

const path = require("path");

const pkg = require("./package.json");
const runtime = require("../runtime.json");
const deps = pkg.dependencies || {};
const homepage = pkg.homepage;
const title = pkg.title;
const version = pkg.version;
const dateHash = runtime?.date || "";
//const isAlreadyBuilding = false;

const config = {
  entry: "./src/index",
  target: "web",
  mode: "development",

  devServer: {
    allowedHosts: "all",
    devMiddleware: {
      publicPath: homepage,
    },
    static: {
      directory: path.join(__dirname, "dist"),
      publicPath: homepage,
    },
    client: {
      logging: "info",
      // Can be used only for `errors`/`warnings`
      //
      // overlay: {
      //   errors: true,
      //   warnings: true,
      // }
      overlay: {
        warnings: false,
      },
      progress: true,
    },
    port: 5001,
    historyApiFallback: {
      // Paths with dots should still use the history fallback.
      // See https://github.com/facebook/create-react-app/issues/387.
      disableDotRule: true,
      index: homepage,
    },
    hot: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },

    open: {
      target: [`http://localhost:8092`],
      app: {
        name: "google-chrome",
        arguments: ["--incognito", "--new-window"],
      },
    },
  },
  resolve: {
    extensions: [".jsx", ".js", ".tsx", ".ts", ".json"],
    fallback: {
      crypto: false,
    },
    alias: {
      PUBLIC_DIR: path.resolve(__dirname, "../../public"),
      ASSETS_DIR: path.resolve(__dirname, "./public"),
      SRC_DIR: path.resolve(__dirname, "./src"),
      PACKAGE_FILE: path.resolve(__dirname, "package.json"),
      COMMON_DIR: path.resolve(__dirname, "../common"),
    },
  },

  output: {
    publicPath: "auto",
    chunkFilename: "static/js/[id].[contenthash].js",
    path: path.resolve(process.cwd(), "dist"),
    filename: "static/js/[name].[contenthash].bundle.js",
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
        test: /\.(png|jpe?g|gif|ico|woff2)$/i,
        type: "asset/resource",
        generator: {
          emit: false,
        },
      },
      {
        test: /\.svg$/i,
        type: "asset/resource",
        generator: {
          emit: false,
        },
        resourceQuery: /url/, // *.svg?url
      },
      {
        test: /\.json$/,
        resourceQuery: /url/,
        use: [
          {
            loader: "file-loader",
            options: {
              emitFile: false,
              name: (resourcePath) => {
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
      {
        test: /\.json$/,
        resourceQuery: { not: [/url/] }, // exclude if *.json?url,
        loader: "json-loader",
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/url/] }, // exclude react component if *.svg?url
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              svgoConfig: {
                plugins: [{ removeViewBox: false }],
              },
            },
          },
        ],
      },
      {
        test: /\.m?js/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
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
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-react", { runtime: "automatic" }],
                "@babel/preset-env",
                "@babel/preset-typescript",
              ],
              plugins: [
                "@babel/plugin-transform-runtime",
                "@babel/plugin-proposal-class-properties",
                "@babel/plugin-proposal-export-default-from",
              ],
            },
          },
          "source-map-loader",
        ],
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new ExternalTemplateRemotesPlugin(),

    new CopyPlugin({
      patterns: [
        // {
        //   context: path.resolve(__dirname, "public"),
        //   from: "images/**/*.*",
        // },
        {
          context: path.resolve(__dirname, "public"),
          from: "locales/**/*.json",
          transform: minifyJson,
        },
      ],
    }),
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
  config.devtool = "source-map";

  if (argv.mode === "production") {
    config.mode = "production";
    config.optimization = {
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
  }

  const remotes = {
    client: "client@/remoteEntry.js",
  };

  if (!env.personal) {
    remotes.login = "login@/login/remoteEntry.js";
  }

  config.plugins.push(
    new ModuleFederationPlugin({
      name: "client",
      filename: "remoteEntry.js",
      remotes: remotes,
      exposes: {
        "./shell": "./src/Shell",
        "./store": "./src/store",
        "./Layout": "./src/components/Layout",
        "./Layout/context": "./src/components/Layout/context.js",
        "./Main": "./src/components/Main",
        "./NavMenu": "./src/components/NavMenu",
        "./PreparationPortalDialog":
          "./src/components/dialogs/PreparationPortalDialog/PreparationPortalDialogWrapper.js",
        "./utils": "./src/helpers/filesUtils.js",
        "./BrandingPage":
          "./src/pages/PortalSettings/categories/common/branding.js",
        "./WhiteLabelPage":
          "./src/pages/PortalSettings/categories/common/Branding/whitelabel.js",
        "./AdditionalResPage":
          "./src/pages/PortalSettings/categories/common/Branding/additionalResources.js",
        "./CompanyInfoPage":
          "./src/pages/PortalSettings/categories/common/Branding/companyInfoSettings.js",
        "./BackupPage": "./src/pages/PortalSettings/categories/data-management",
        "./RestorePage":
          "./src/pages/PortalSettings/categories/data-management/backup/restore-backup",
        "./PaymentsPage": "./src/pages/PortalSettings/categories/payments",
        "./ChangeStorageQuotaDialog":
          "./src/components/dialogs/ChangeStorageQuotaDialog",
      },
      shared: {
        ...deps,
        ...sharedDeps,
      },
    }),
  );

  const htmlTemplate = {
    title: title,
    template: "./public/index.html",
    publicPath: homepage,
    base: `${homepage}/`,
  };

  if (!!env.hideText) {
    htmlTemplate.custom = `
      <style type="text/css">
        div,
        p,
        a,
        span,
        button,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        ::placeholder {
          color: rgba(0, 0, 0, 0) !important;
        }

      </style>`;
  } else {
    htmlTemplate.browserDetectorUrl = `/static/scripts/browserDetector.js?hash=${
      runtime.checksums["browserDetector.js"] || dateHash
    }`;
    htmlTemplate.configUrl = `/static/scripts/config.json?hash=${
      runtime.checksums["config.json"] || dateHash
    }`;
  }

  config.plugins.push(new HtmlWebpackPlugin(htmlTemplate));

  const BUILD_AT = DefinePlugin.runtimeValue(getBuildDate, true);

  const defines = {
    VERSION: JSON.stringify(version),
    BUILD_AT,
    IS_PERSONAL: env.personal || false,
  };

  config.plugins.push(new DefinePlugin(defines));

  if (env.mode === "analyze") {
    config.plugins.push(new BundleAnalyzerPlugin());
  }

  config.plugins.push(
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
  );

  return config;
};
