// (c) Copyright Ascensio System SIA 2009-2025
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

// Vite library-mode build config for the standalone onlyoffice-crypto bundle.
//
// Outputs:
//   dist/crypto/onlyoffice-crypto.js      — ES module
//   dist/crypto/onlyoffice-crypto.umd.js  — UMD (global: OnlyofficeCrypto)
//
// All dependencies are bundled; the library has no runtime npm requirements.
// Web Crypto API is a browser/Node built-in — no polyfill is included.

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
        // Single IIFE file — <script src="onlyoffice-crypto.iife.js">
        // All exports available via window.OnlyofficeCrypto
        inlineDynamicImports: true,
      },
    },
  },
});
