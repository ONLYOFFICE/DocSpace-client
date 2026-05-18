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
