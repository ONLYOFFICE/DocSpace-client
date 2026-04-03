// (c) Copyright Ascensio System SIA 2009-2026
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

import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

import { pkg, getBuildDate } from "./config/utils";
import { jsxInJsPlugin } from "./config/plugins/jsx-in-js";
import { staticUrlPlugin } from "./config/plugins/static-url";
import { htmlTransformPlugin } from "./config/plugins/html-transform";
import { bannerPlugin } from "./config/plugins/banner";
import { copyLocalesPlugin } from "./config/plugins/copy-locales";
import { copyFontsPlugin } from "./config/plugins/copy-fonts";
import { serveRootPublicPlugin } from "./config/plugins/serve-root-public";
import { resolve } from "./config/resolve";
import { css } from "./config/css";
import { server } from "./config/server";
import { getBuildConfig } from "./config/build";

// ===========================================================================
// Main Vite configuration
// ===========================================================================
export default defineConfig(async ({ mode }): Promise<UserConfig> => {
  const isProduction = mode === "production";
  const isAnalyze = mode === "analyze";

  return {
    root: __dirname,
    base: "/",

    resolve,

    define: {
      VERSION: JSON.stringify(pkg.version),
      BUILD_AT: JSON.stringify(getBuildDate()),
      "process.env.NODE_ENV": JSON.stringify(mode),
    },

    plugins: [
      jsxInJsPlugin(),
      staticUrlPlugin(),
      svgr({
        svgrOptions: {
          exportType: "default",
          svgo: true,
          svgoConfig: {
            plugins: [
              {
                name: "preset-default",
                params: {
                  overrides: {
                    removeViewBox: false,
                  },
                },
              },
            ],
          },
        },
        include: "**/*.svg",
        exclude: "**/*.svg?url",
      }),
      react(),
      htmlTransformPlugin(),
      serveRootPublicPlugin(),
      isProduction && bannerPlugin(),
      isProduction && copyLocalesPlugin(),
      isProduction && copyFontsPlugin(),
      isAnalyze &&
        (await import("rollup-plugin-visualizer")).visualizer({
          open: true,
          filename: "dist/stats.html",
        }),
    ].filter(Boolean),

    css,

    server,

    build: getBuildConfig(isProduction),

    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router",
        "mobx",
        "mobx-react",
        "styled-components",
        "i18next",
        "react-i18next",
        "axios",
        "lodash",
        "firebase/compat/app",
        "firebase/compat/remote-config",
        "firebase/compat/storage",
        "firebase/compat/database",
      ],
    },
  };
});

