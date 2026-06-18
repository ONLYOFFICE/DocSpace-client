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

import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

import { pkg, getBuildDate } from "./config/utils";
import { jsxInJsPlugin } from "./config/plugins/jsx-in-js";
import { staticUrlPlugin } from "./config/plugins/static-url";
import { htmlTransformPlugin } from "./config/plugins/html-transform";
import { bannerPlugin } from "./config/plugins/banner";
import {
  copyLocalesPlugin,
  computeCombinedLocaleHashes,
} from "./config/plugins/copy-locales";
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
      // Per-language ?hash= cache-busters for the combined locale bundle.
      // Only the production build emits _combined.json, so dev gets {}.
      COMBINED_LOCALE_HASHES: JSON.stringify(
        isProduction ? computeCombinedLocaleHashes() : {},
      ),
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

