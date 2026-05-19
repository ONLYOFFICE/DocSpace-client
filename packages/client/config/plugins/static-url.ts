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

import { type Plugin } from "vite";
import path from "path";
import { fileHash, rootDir } from "../utils";

// ---------------------------------------------------------------------------
// Custom plugin: rewrite ?url imports from ASSETS_DIR / PUBLIC_DIR into
// plain const declarations with public URL strings and ?hash= cache busters.
//
// Vite's built-in ?url handling emits assets with content-hashed filenames
// (e.g. icon.C6ykIhR6.svg) which breaks the existing nginx cache-control
// setup that relies on ?hash= query parameters.  Files from public/ must be
// served by nginx — NOT bundled into dist/.
//
// This plugin uses a transform hook (runs before Rollup's import analysis)
// to rewrite:
//   import X from "ASSETS_DIR/locales/ru/File.json?url";
//     → const X = "/locales/ru/File.json?hash=<md5>";
//   import Y from "PUBLIC_DIR/images/icons/16/icon.svg?url";
//     → const Y = /static/images/icons/16/icon.svg?hash=<md5>  (with /static prefix for non-JSON)
//
// PUBLIC_DIR non-JSON files get a /static/ prefix (nginx serves root
// public/ at /static/).  JSON translation files skip the prefix because
// language-helpers.js prepends it for Common namespace files.
// ---------------------------------------------------------------------------
export const staticUrlPlugin = (): Plugin => {
  const assetsDir = path.resolve(rootDir, "public");
  const publicDir = path.resolve(rootDir, "../../public");

  return {
    name: "static-url-import",
    enforce: "pre",

    transform(code) {
      if (!code.includes("?url")) return null;

      let changed = false;

      const importRe =
        /import\s+(\w+)\s+from\s+["']((?:ASSETS_DIR|PUBLIC_DIR)\/[^"']+)\?url["'];?/g;

      const result = code.replace(
        importRe,
        (_match, varName: string, importPath: string) => {
          changed = true;

          let resolved: string;
          let relativePath: string;
          let prefix = "";

          if (importPath.startsWith("ASSETS_DIR/")) {
            resolved = path.resolve(
              assetsDir,
              importPath.slice("ASSETS_DIR/".length),
            );
            relativePath = path.relative(assetsDir, resolved);
          } else {
            resolved = path.resolve(
              publicDir,
              importPath.slice("PUBLIC_DIR/".length),
            );
            relativePath = path.relative(publicDir, resolved);
            // Non-JSON files from PUBLIC_DIR need /static prefix because
            // nginx serves the root public/ directory at /static/.
            // JSON translation files skip this — language-helpers.js adds it.
            if (!resolved.endsWith(".json")) {
              prefix = "/static";
            }
          }

          const urlPath =
            prefix + "/" + relativePath.split(path.sep).join("/");
          const hash = fileHash(resolved);
          const url = hash ? `${urlPath}?hash=${hash}` : urlPath;

          return `const ${varName} = ${JSON.stringify(url)};`;
        },
      );

      if (!changed) return null;
      return { code: result, map: null };
    },
  };
};
