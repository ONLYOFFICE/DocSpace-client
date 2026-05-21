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

// Vite library-mode build config for the standalone onlyoffice-crypto bundle.
//
// Outputs:
//   dist/crypto/onlyoffice-crypto.js      - ES module
//   dist/crypto/onlyoffice-crypto.umd.js  - UMD (global: OnlyofficeCrypto)
//
// All dependencies are bundled; the library has no runtime npm requirements.
// Web Crypto API is a browser/Node built-in - no polyfill is included.

import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    // Write into a subdirectory so this build never clobbers the shared
    // package's regular TypeScript declaration output.
    outDir: resolve(__dirname, "../../dist/crypto"),
    emptyOutDir: false,

    // Target modern browsers that natively support the Web Crypto API.
    target: "esnext",
    minify: false,

    lib: {
      entry: resolve(__dirname, "lib-entry.ts"),
      name: "OnlyofficeCrypto",
      fileName: () => "onlyoffice-crypto.js",
      formats: ["iife"],
    },

    rollupOptions: {
      external: [],
      output: {
        // Single IIFE file - <script src="onlyoffice-crypto.iife.js">
        // All exports available via window.OnlyofficeCrypto
        inlineDynamicImports: true,
      },
    },
  },
});
