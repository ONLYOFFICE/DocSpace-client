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
// Custom plugin: copy and minify locale JSON files to dist/ (production build)
// Replaces Webpack's CopyPlugin with minifyJson transform.
// ---------------------------------------------------------------------------
function copyAndMinifyLocales(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyAndMinifyLocales(srcPath, destPath);
    } else if (entry.name.endsWith(".json")) {
      try {
        const content = JSON.parse(fs.readFileSync(srcPath, "utf-8"));
        fs.writeFileSync(destPath, JSON.stringify(content), "utf-8");
      } catch {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

export const copyLocalesPlugin = (): Plugin => ({
  name: "copy-locales",
  closeBundle() {
    const srcDir = path.resolve(rootDir, "public/locales");
    const destDir = path.resolve(rootDir, "dist/locales");
    copyAndMinifyLocales(srcDir, destDir);
  },
});
