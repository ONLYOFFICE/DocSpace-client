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
          if (id.includes("styled-components")) return "vendor-styled";
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
