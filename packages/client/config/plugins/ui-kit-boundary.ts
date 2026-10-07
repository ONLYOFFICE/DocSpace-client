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

import path from "path";
import type { Plugin } from "vite";

import { isInside, uiKitBoundaryError } from "../ui-kit-dev";

const NODE_MODULES = `${path.sep}node_modules${path.sep}`;

const bare = (id: string) => id.split("?")[0].split("#")[0];

// Guards JS and TS imports only. SCSS never reaches resolveId -- sass resolves
// `@use` through the importer in config/css.ts, which carries the same check.
//
// `root` is the ui-kit checkout being served (config/ui-kit-dev.ts knows it);
// it is a parameter rather than a module import so the plugin can be exercised
// against a fake root without a checkout on disk.
export const uiKitBoundaryPlugin = (root: string): Plugin => ({
  name: "ui-kit-boundary",
  enforce: "pre",
  apply: "serve",
  resolveId(source, importer) {
    if (!importer || source.startsWith("\0")) return null;

    const from = path.normalize(bare(importer));

    if (!isInside(root, from) || from.includes(NODE_MODULES)) return null;

    const spec = bare(source);

    if (spec.startsWith("/@") || spec.startsWith("virtual:")) return null;

    // Judged by destination, not by specifier: `vite:alias` runs ahead of this
    // plugin, so every client alias arrives already rewritten to an absolute
    // path. Checking where it lands covers them all, including aliases added
    // later, and needs no list to keep in step with config/resolve.ts.
    const target = spec.startsWith(".")
      ? path.resolve(path.dirname(from), spec)
      : path.isAbsolute(spec)
        ? path.normalize(spec)
        : null;

    if (target && !isInside(root, target))
      throw uiKitBoundaryError(
        from,
        source,
        `it points outside the ui-kit checkout, at ${target}`,
      );

    return null;
  },
});
