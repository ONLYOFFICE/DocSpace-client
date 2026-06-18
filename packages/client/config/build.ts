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
  // Emit a single stylesheet instead of one CSS file per chunk. The lazy
  // route styles are tiny next to shared.css (which already loads eagerly),
  // so bundling all CSS adds only ~34KB gzip up front while collapsing 16
  // CSS files into 1 — far fewer CloudFront requests.
  cssCodeSplit: false,
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
      // Compact chunking to minimise the number of files fetched on the
      // initial load. Rolldown otherwise emits dozens of tiny shared chunks
      // (every reused @docspace/shared module → its own file) and preloads
      // them all from the entry HTML, which multiplies CloudFront requests.
      // `codeSplitting` groups dependencies and merges small chunks so the
      // browser fetches a handful of files instead of ~100.
      codeSplitting: {
        // Merge any chunk below this size into a larger neighbour.
        minSize: 160_000,
        // Pull a module into its group as soon as it is referenced (1+),
        // instead of leaving lightly-shared modules as their own tiny chunks.
        minShareCount: 1,
        groups: [
          // Firebase is large and only needed for push/remote-config — keep
          // it isolated so it can stay lazy.
          {
            name: "vendor-firebase",
            test: /[\\/]node_modules[\\/].*firebase/,
            priority: 100,
          },
          // Core framework used on every page.
          {
            name: "vendor-react",
            test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-i18next|scheduler|mobx|mobx-react|styled-components)/,
            priority: 90,
          },
          // Everything else from node_modules in a single vendor chunk.
          {
            name: "vendor",
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
          },
          // Our shared package + the ui-kit submodule (libs/ui-kit) reused
          // across routes — one chunk instead of dozens of tiny per-component
          // files (color-picker, slider, table, icon SVGs, …).
          {
            name: "shared",
            test: /([\\/]packages[\\/]shared|[\\/]libs[\\/]ui-kit)[\\/]/,
            priority: 5,
          },
        ],
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
