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
