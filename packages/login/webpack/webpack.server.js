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
const baseConfig = require("./webpack.base.js");
const path = require("path");
const DefinePlugin = require("webpack").DefinePlugin;
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const runtime = require("../../runtime.json");
const dateHash = runtime?.date || "";

const serverConfig = {
  target: "node",
  name: "server",
  entry: {
    server: "./src/server/index.ts",
  },

  output: {
    path: path.resolve(process.cwd(), "dist/"),
    filename: "[name].js",
    libraryTarget: "commonjs2",
    chunkFilename: "chunks/[name].js",
    assetModuleFilename: (pathData) => {
      //console.log({ pathData });

      let result = pathData.filename
        .substr(pathData.filename.indexOf("public/"))
        .split("/")
        .slice(1);

      result.pop();

      let folder = result.join("/");

      folder += result.length === 0 ? "" : "/";

      return `/login/static/${folder}[name][ext]?hash=[contenthash]`; //`${folder}/[name].[contenthash][ext]`;
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        generator: {
          emit: false,
        },
        type: "asset/resource",
        resourceQuery: /url/, // *.css?url
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "src/server/config/",
        },
      ],
    }),
  ],
};

module.exports = (env, argv) => {
  if (argv.mode === "production") {
    serverConfig.mode = "production";
    serverConfig.optimization = {
      minimize: !env.minimize,
      minimizer: [new TerserPlugin()],
    };
  } else {
    serverConfig.mode = "development";
  }
  serverConfig.plugins = [
    ...serverConfig.plugins,
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

  return merge(baseConfig, serverConfig);
};
