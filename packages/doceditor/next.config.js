/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/** @type {import('next').NextConfig} */

const path = require("path");
const fs = require("fs");
const os = require("os");

// Use fs.readFileSync instead of require to avoid module system issues
const packagePath = path.resolve(__dirname, "package.json");
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

const BannerPlugin = require("webpack").BannerPlugin;
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

// Use createRequire to properly import ES module
const { createRequire } = require("module");
const requireESM = createRequire(__filename);

const buildModule = requireESM("@docspace/shared/utils/build");
const { getBanner, getAllLocalIps } = buildModule.default;

const productionMode = "production";
const version = pkg.version;
const banner = getBanner(version);

const isDev = process.env.NODE_ENV !== productionMode;

const nextConfig = {
  basePath: "/doceditor",
  typescript: {
    ignoreBuildErrors: true,
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
    return `${pkg.name}-${pkg.version}-${new Date().getTime()}`;
  },
  images: {
    unoptimized: true,
  },

  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  devIndicators: false,
};

if (process.env.DEPLOY) {
  nextConfig.output = "standalone";
}

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

if (isDev) {
  const localIps = getAllLocalIps(os);
  nextConfig.allowedDevOrigins = localIps;
}

module.exports = withBundleAnalyzer({
  webpack(config) {
    const isProduction = config.mode === productionMode;
    // Add resolve configuration for shared package
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "@docspace/shared": path.resolve(__dirname, "../shared"),
        "@docspace/ui-kit": path.resolve(__dirname, "../../libs/ui-kit"),
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

    config.module.rules.push(
      // Asset handling
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
  ...nextConfig,
});
