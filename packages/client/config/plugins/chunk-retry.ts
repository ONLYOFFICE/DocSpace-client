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

// Relative import: the Vite config is bundled by esbuild before any
// workspace alias resolution is available.
import { buildChunkRetryInlineScript } from "../../../shared/utils/chunk-retry-script";

// URL pattern of the assets emitted by this app's production build:
// JS bundles under /static/js/, the style bundle under /static/styles/ and
// the shared fonts stylesheet under /static/css/.
const CLIENT_ASSET_PATTERN =
  "/static/(?:js/.+?\\.js|(?:styles|css)/.+?\\.css)";

// ---------------------------------------------------------------------------
// Custom plugin: inline the shared chunk-retry bootstrap into <head>.
// It retries bundle loads dropped by background throttling or a lost
// connection (see @docspace/shared/utils/chunk-retry-script). Injected only
// for production builds: in dev Vite serves unbundled modules from /src and
// HMR already handles recovery.
// ---------------------------------------------------------------------------
export const chunkRetryPlugin = (): Plugin => {
  return {
    name: "chunk-retry-inline",
    apply: "build",

    transformIndexHtml: {
      order: "pre",
      handler() {
        return [
          {
            tag: "script",
            attrs: { id: "chunk-retry" },
            children: buildChunkRetryInlineScript(CLIENT_ASSET_PATTERN),
            injectTo: "head-prepend",
          },
        ];
      },
    },
  };
};
