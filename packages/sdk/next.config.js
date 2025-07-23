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

/** @type {import('next').NextConfig} */

const path = require("path");
const pkg = require("./package.json");

const nextConfig = {
  basePath: "/sdk",
  output: "standalone",
  typescript: {
    ignoreBuildErrors: process.env.TS_ERRORS_IGNORE === "true",
  },
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
  env: {
    NEXT_PUBLIC_E2E_TEST: process.env.E2E_TEST,
  },
  webpack: (config) => {
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
};

module.exports = nextConfig;
