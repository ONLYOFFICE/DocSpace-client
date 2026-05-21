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
import fs from "fs";
import { rootDir } from "../utils";

// ---------------------------------------------------------------------------
// Custom plugin: serve files from root public/ directory in dev mode.
// The root public/ contains scripts/config.json, images/, css/fonts.css, etc.
// These are normally served by nginx in production, but in dev we need
// Vite to serve them as a fallback.
// ---------------------------------------------------------------------------
export const serveRootPublicPlugin = (): Plugin => {
  const rootPublicDir = path.resolve(rootDir, "../../public");

  return {
    name: "serve-root-public",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();

        let urlPath = req.url.split("?")[0];
        // Strip /static/ prefix — nginx serves root public/ at /static/
        if (urlPath.startsWith("/static/")) {
          urlPath = urlPath.slice("/static".length);
        }
        const filePath = path.join(rootPublicDir, urlPath);

        // Prevent path traversal outside rootPublicDir
        if (!filePath.startsWith(rootPublicDir)) return next();

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath);
          const mimeTypes: Record<string, string> = {
            ".json": "application/json",
            ".js": "application/javascript",
            ".css": "text/css",
            ".svg": "image/svg+xml",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".gif": "image/gif",
            ".ico": "image/x-icon",
            ".woff": "font/woff",
            ".woff2": "font/woff2",
            ".ttf": "font/ttf",
            ".eot": "application/vnd.ms-fontobject",
          };
          res.setHeader(
            "Content-Type",
            mimeTypes[ext] || "application/octet-stream",
          );
          fs.createReadStream(filePath).pipe(res);
          return;
        }

        next();
      });
    },
  };
};
