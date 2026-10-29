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
// Output: dist/crypto/onlyoffice-crypto.js - one IIFE file, global
// `OnlyofficeCrypto`, every dependency bundled, no runtime npm requirements.
// Web Crypto API is a browser/Node built-in - no polyfill is included.
//
// Build from packages/client (the only package that depends on vite):
//   pnpm run build:crypto
//
// The first line of the output and the `LIBRARY_VERSION` / `BUILD_COMMIT`
// exports name the build, so a deployed copy can be identified without
// comparing files.

import { execSync } from "node:child_process";
import { resolve } from "node:path";

import { LIBRARY_VERSION } from "./types";

let commit = "unknown";
try {
  // The short hash, "-dirty" appended when the tree has uncommitted changes.
  commit = execSync("git describe --always --dirty --exclude=* --abbrev=12", {
    cwd: __dirname,
    encoding: "utf8",
  }).trim();
} catch {
  // not a git checkout: the bundle still builds, stamped "unknown"
}

// NOTE: no `import ... from "vite"` here on purpose - the @docspace/shared
// package does not depend on vite directly, so the config must stay loadable
// by whatever vite binary the monorepo provides (e.g. packages/client's).
/** @type {import("vite").UserConfig} */
export default {
  define: {
    __ONLYOFFICE_CRYPTO_COMMIT__: JSON.stringify(commit),
  },

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
        banner: `/*! onlyoffice-crypto ${LIBRARY_VERSION} ${commit} */`,
        // Single IIFE file - <script src="onlyoffice-crypto.js">
        // All exports available via window.OnlyofficeCrypto
        inlineDynamicImports: true,
      },
    },
  },
};
