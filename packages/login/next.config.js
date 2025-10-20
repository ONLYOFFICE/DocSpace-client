// (c) Copyright Ascensio System SIA 2009-2025
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

/** @type {import('next').NextConfig} */

const path = require("path");
const pkg = require("./package.json");
const BannerPlugin = require("webpack").BannerPlugin;
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { getBanner } = require("@docspace/shared/utils/build").default;

const version = pkg.version;
const banner = getBanner(version);

const nextConfig = {
  basePath: "/login",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: [
    "nconf",
    "date-and-time",
    "winston",
    "winston-cloudwatch",
    "winston-daily-rotate-file",
    "@aws-sdk/client-cloudwatch-logs",
  ],
  compiler: {
    styledComponents: true,
  },
  generateBuildId: async () => {
    // This could be anything, using the latest git hash
    return `${pkg.name} - ${pkg.version} `;
  },
  images: {
    unoptimized: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  webpack: (config) => {
    const isProduction = config.mode === "production";
    // Add resolve configuration for shared package
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "@docspace/shared": path.resolve(__dirname, "../shared"),
      },
    };

    config.devtool = isProduction ? "source-map" : false; // TODO: replace to "eval-cheap-module-source-map" if you want to debug in a browser;

    if (isProduction) {
      config.optimization = {
        splitChunks: { chunks: "all" },
        minimize: true,
        minimizer: [
          new CssMinimizerPlugin({
            minimizerOptions: {
              preset: [
                "default",
                {
                  discardComments: {
                    removeAll: false,
                    remove: (comment) => {
                      // Keep copyright comments that contain the copyright text
                      const isCopyright =
                        comment.includes("Copyright Ascensio System SIA") &&
                        comment.includes("https://www.onlyoffice.com/");
                      return !isCopyright;
                    },
                  },
                },
              ],
            },
          }),
          new TerserPlugin({
            terserOptions: {
              format: {
                comments: /\*\s*\(c\)\s+Copyright\s+Ascensio\s+System\s+SIA/i,
              },
            },
            extractComments: false,
            parallel: false,
          }),
        ],
      };

      config.plugins.push(
        new BannerPlugin({
          raw: true,
          banner,
        }),
      );
    }

    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg"),
    );

    const imageRule = config.module.rules.find(
      (rule) => rule.loader === "next-image-loader",
    );
    imageRule.resourceQuery = {
      not: [...fileLoaderRule.resourceQuery.not, /url/],
    };

    // Configure CSS handling
    config.module.rules.push(
      // Existing asset rules
      {
        type: "asset/resource",
        generator: {
          emit: false,
          filename: "static/chunks/[path][name][ext]?[hash]",
        },
        test: /\.(svg|png|jpe?g|gif|ico|woff2)$/i,
        resourceQuery: /url/,
      },
      // SVG handling
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        loader: "@svgr/webpack",
        options: {
          prettier: false,
          svgo: true,
          svgoConfig: {
            plugins: [
              {
                name: "preset-default",
                params: {
                  overrides: { removeViewBox: false, cleanupIds: false },
                },
              },
            ],
          },
          titleProp: true,
        },
      },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    if (config?.output?.filename)
      config.output.filename = config.output.filename?.replace(
        "[chunkhash]",
        `[contenthash]`,
      );

    return config;
  },
  devIndicators: false,
};

if (process.env.DEPLOY) {
  nextConfig.output = "standalone";
}

module.exports = nextConfig;
