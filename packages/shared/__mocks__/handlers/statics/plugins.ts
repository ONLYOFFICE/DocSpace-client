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

import { http } from "msw";
import * as fs from "fs";
import * as path from "path";
import { unzipSync, type Unzipped } from "fflate";

// Path to test plugin archives, one <pluginName>.zip per plugin
const PLUGINS_DIR = path.resolve(
  __dirname,
  "../../../../client/__tests__/plugins/test-plugins",
);

// Mock plugin JavaScript content (fallback when plugin archive not found)
const mockPluginJs = `
(function() {
  // Mock plugin script
  console.log('Mock plugin loaded');
})();
`;

// Mock plugin CSS content (fallback when archive has no plugin.css)
const mockPluginCss = `
/* Mock plugin styles */
.mock-plugin { display: block; }
`;

const archiveCache = new Map<string, Unzipped | null>();

const readArchive = (pluginName: string) => {
  const cached = archiveCache.get(pluginName);

  if (cached !== undefined) return cached;

  let archive: Unzipped | null = null;

  try {
    const zip = fs.readFileSync(path.join(PLUGINS_DIR, `${pluginName}.zip`));
    archive = unzipSync(new Uint8Array(zip));
  } catch {
    archive = null;
  }

  archiveCache.set(pluginName, archive);

  return archive;
};

const readArchiveEntry = (pluginName: string, entryName: string) =>
  readArchive(pluginName)?.[entryName] ?? null;

const readArchiveText = (pluginName: string, entryName: string) => {
  const content = readArchiveEntry(pluginName, entryName);

  return content ? new TextDecoder().decode(content) : null;
};

const getContentType = (entryName: string) => {
  switch (path.extname(entryName).toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    case ".gif":
      return "image/gif";
    case ".html":
      return "text/html; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    default:
      return "application/octet-stream";
  }
};

export const pluginJsHandler = () => {
  return http.get("*/plugins/:pluginName/plugin.js", ({ params }) => {
    const content = readArchiveText(String(params.pluginName), "plugin.js");

    return new Response(content ?? mockPluginJs, {
      headers: { "Content-Type": "application/javascript; charset=utf-8" },
    });
  });
};

export const pluginCssHandler = () => {
  return http.get("*/plugins/:pluginName/plugin.css", ({ params }) => {
    const content = readArchiveText(String(params.pluginName), "plugin.css");

    return new Response(content ?? mockPluginCss, {
      headers: { "Content-Type": "text/css; charset=utf-8" },
    });
  });
};

export const pluginAssetsHandler = () => {
  return http.get("*/plugins/:pluginName/assets/*", ({ request, params }) => {
    const assetName = new URL(request.url).pathname.split("/assets/")[1] ?? "";
    const content = readArchiveEntry(
      String(params.pluginName),
      `assets/${assetName}`,
    );

    if (!content) return new Response(null, { status: 404 });

    return new Response(content.slice().buffer, {
      headers: { "Content-Type": getContentType(assetName) },
    });
  });
};
