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

import type { UserConfig } from "vite";

export const getBuildConfig = (
  isProduction: boolean,
): UserConfig["build"] => ({
  outDir: "dist",
  sourcemap: isProduction ? "hidden" : "inline",
  // Disable base64 inlining of small assets so that imported file names
  // are preserved in URLs.  The Avatar component detects default photos
  // by checking whether the URL contains "default_user_photo" and renders
  // an SVG placeholder instead of the PNG.  Inlining turns the URL into a
  // data-URI which breaks this detection.
  assetsInlineLimit: 0,
  rollupOptions: {
    onwarn(warning, warn) {
      // react-virtualized ships a Flow directive that Rollup doesn't understand
      if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
      // sjcl optionally imports Node "crypto" for PRNG seeding;
      // it falls back to window.crypto in the browser.
      if (warning.message?.includes("externalized for browser")) return;
      // json2-mod uses eval() internally — safe, informational only
      if (
        warning.code === "EVAL" &&
        warning.id?.includes("json2-mod")
      )
        return;
      // Suppress Vite reporter warnings about modules that are both dynamically
      // and statically imported (route-level lazy loading + parent static import).
      // These are informational — they just mean those chunks won't be code-split.
      if (
        warning.message?.includes(
          "dynamic import will not move module into another chunk",
        )
      )
        return;
      warn(warning);
    },
    output: {
      entryFileNames: "static/js/[name].[hash].bundle.js",
      chunkFileNames: "static/js/[name].[hash].js",
      assetFileNames: (assetInfo: { name?: string; names?: string[] }) => {
        // Rolldown (Vite 8) uses `name: string`; Rollup used `names: string[]`
        const name = assetInfo.name ?? assetInfo.names?.[0] ?? "";
        if (name.endsWith(".css")) {
          return "static/styles/[name].[hash][extname]";
        }
        return "static/[name].[hash][extname]";
      },
      manualChunks(id: string) {
        if (id.includes("node_modules")) {
          if (id.includes("firebase")) return "vendor-firebase";
          if (id.includes("mobx")) return "vendor-mobx";
          if (
            id.includes("react-dom") ||
            id.includes("react-router") ||
            id.includes("react-i18next") ||
            id.includes("scheduler")
          )
            return "vendor-react";
          if (id.includes("lodash")) return "vendor-lodash";
          if (id.includes("docspace-api-sdk")) return "vendor-docspace-api-sdk";
        }
      },
    },
  },
  chunkSizeWarningLimit: 1000,
  minify: isProduction ? "esbuild" : false,
  commonjsOptions: {
    // Handle firebase compat and other packages that use require() in ESM
    transformMixedEsModules: true,
  },
});
