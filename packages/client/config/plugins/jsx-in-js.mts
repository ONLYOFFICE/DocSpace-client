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

import { type Plugin, transformWithOxc } from "vite";

// ---------------------------------------------------------------------------
// Custom plugin: transform JSX in .js files via esbuild.
// The project was ejected from CRA where Babel processed all .js files with
// JSX support. Vite/Rollup only handles JSX in .jsx/.tsx files by default.
// This plugin pre-transforms .js files containing JSX before Rollup parses them.
// ---------------------------------------------------------------------------
export const jsxInJsPlugin = (): Plugin => ({
  name: "jsx-in-js",
  enforce: "pre",
  config() {
    // Vite 8 uses Rolldown for dep scanning. Tell Rolldown to parse .js
    // files as JSX — the Rolldown equivalent of esbuild's loader[".js"]="jsx".
    return {
      optimizeDeps: {
        rolldownOptions: {
          moduleTypes: { ".js": "jsx" },
        },
      },
    };
  },
  async transform(code, id) {
    if (!id.endsWith(".js") || id.includes("node_modules")) return null;
    // Quick check: skip files that clearly don't contain JSX.
    // Match opening JSX tags (<Component, <div) or closing tags (</),
    // but not plain comparison operators (a < b).
    if (!/(<\/|<[A-Za-z])/.test(code)) return null;

    return transformWithOxc(code, id, {
      lang: "jsx",
      jsx: { runtime: "automatic", importSource: "react" },
    });
  },
});
