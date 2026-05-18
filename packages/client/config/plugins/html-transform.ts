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
import { fileHash, publicScriptsDir, rootDir } from "../utils";

// ---------------------------------------------------------------------------
// Custom plugin: inject content hashes into index.html placeholders.
// In dev mode, when accessed through a backend proxy (e.g. port 8092),
// rewrite the module entry point to use an absolute Vite URL so the browser
// loads ES modules directly from the Vite dev server instead of the proxy.
// ---------------------------------------------------------------------------
export const htmlTransformPlugin = (): Plugin => {
  // Captured from the incoming request so transformIndexHtml can build
  // absolute Vite URLs that work regardless of which host the browser uses.
  let currentRequestHost = "localhost";

  return {
    name: "html-transform",

    configureServer(server) {
      // Runs BEFORE Vite's internal HTML middleware, so the host is
      // already captured by the time transformIndexHtml fires.
      server.middlewares.use((req, _res, next) => {
        if (req.headers.host) {
          currentRequestHost = req.headers.host.split(":")[0];
        }
        next();
      });
    },

    transformIndexHtml: {
      // "post" order so we run AFTER Vite injects /@vite/client and
      // @vitejs/plugin-react injects the /@react-refresh preamble.
      // This lets us rewrite all module URLs to absolute Vite origin,
      // preventing split module identity when served through a proxy.
      order: "post",
      handler(html, ctx) {
        html = html
          .replace(
            /%DOCSPACE_BROWSER_DETECTOR_HASH%/g,
            fileHash(path.join(publicScriptsDir, "browserDetector.js")),
          )
          .replace(
            /%DOCSPACE_CONFIG_HASH%/g,
            fileHash(path.join(publicScriptsDir, "config.json")),
          )
          .replace(
            /%DOCSPACE_FONTS_CSS_HASH%/g,
            fileHash(
              path.resolve(rootDir, "../../public/css/fonts.css"),
            ),
          );

        // In dev mode, rewrite ALL module URLs to use absolute Vite origin.
        // When the page is served through a proxy (e.g. nginx on :8092),
        // relative imports like /@vite/client and /@react-refresh resolve
        // to the proxy origin, while bootstrap.js loads from Vite directly.
        // This creates two separate /@react-refresh module instances —
        // the preamble hooks register on one, but components register on
        // the other, breaking React Fast Refresh.
        if (ctx.server) {
          const port = ctx.server.config.server.port || 5001;
          const host = process.env.VITE_DEV_HOST || currentRequestHost;
          const viteOrigin = `http://${host}:${port}`;
          // Rewrite all module <script> src attributes that start with "/"
          // to use the absolute Vite origin.  This must handle the optional
          // ?t=<timestamp> query that Vite's devHtmlHook appends after HMR
          // invalidation — an exact string match would stop working after
          // the first hot-update because the URL gains a query string.
          html = html.replace(
            /(<script\b[^>]*\btype\s*=\s*["']module["'][^>]*\bsrc\s*=\s*["'])(\/[^"']*)(["'])/g,
            `$1${viteOrigin}$2$3`,
          );
          // Rewrite import-from specifiers in inline module scripts
          // (e.g. the React-refresh preamble injected by @vitejs/plugin-react)
          html = html.replace(
            /( from\s+["'])(\/[^"']+)(["'])/g,
            `$1${viteOrigin}$2$3`,
          );
        }

        return html;
      },
    },
  };
};
