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
// Custom plugin: copy fonts CSS and font files to dist/static/ (production build)
// In production these are served by nginx from /var/www/public/ at /static/.
// For E2E tests (serve dist -s) and self-contained builds, we need them in dist/.
// ---------------------------------------------------------------------------
export const copyFontsPlugin = (): Plugin => ({
  name: "copy-fonts",
  closeBundle() {
    const rootPublicDir = path.resolve(rootDir, "../../public");

    // Copy css/fonts.css → dist/static/css/fonts.css
    const cssSrc = path.join(rootPublicDir, "css/fonts.css");
    const cssDest = path.resolve(rootDir, "dist/static/css");
    if (fs.existsSync(cssSrc)) {
      fs.mkdirSync(cssDest, { recursive: true });
      fs.copyFileSync(cssSrc, path.join(cssDest, "fonts.css"));
    }

    // Copy fonts/v35/ → dist/static/fonts/v35/
    const fontsSrc = path.join(rootPublicDir, "fonts");
    const fontsDest = path.resolve(rootDir, "dist/static/fonts");
    if (fs.existsSync(fontsSrc)) {
      const copyDir = (src: string, dest: string) => {
        fs.mkdirSync(dest, { recursive: true });
        for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };
      copyDir(fontsSrc, fontsDest);
    }
  },
});
