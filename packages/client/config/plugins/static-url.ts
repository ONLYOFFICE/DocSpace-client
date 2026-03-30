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
