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

import path from "path";
import { defineConfig, type Plugin } from "vitest/config";
import svgr from "vite-plugin-svgr";

// Mirror the shared vitest setup: same SVG handling, same jsdom env, same
// global i18n + DOMRect mocks via shared/vitest/setupTests.ts. The aliases
// below match config/resolve.ts so SRC_DIR/PACKAGE_FILE/@docspace/* imports
// resolve identically to the dev server.

const mockSvgUrlPlugin = (): Plugin => ({
  name: "mock-svg-url",
  enforce: "pre",
  resolveId(id) {
    if (id.endsWith(".svg?url")) {
      return id;
    }
  },
  load(id) {
    if (id.endsWith(".svg?url")) {
      return 'export default "test-file-stub"';
    }
  },
});

export default defineConfig({
  plugins: [
    mockSvgUrlPlugin(),
    svgr({
      svgrOptions: {
        exportType: "default",
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: "**/*.svg",
      exclude: "**/*.svg?url",
    }),
  ],

  test: {
    environment: "jsdom",
    setupFiles: ["./vitest/setupTests.ts"],
    globals: true,
    clearMocks: true,
    pool: process.env.POOL || "threads",
    testTimeout: 30000,
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    // Playwright e2e specs live under __tests__/; never let vitest pick them up.
    exclude: [
      "node_modules",
      "dist",
      "__tests__/**",
      "tests/**",
      ".{idea,git,cache,output,temp}/**",
    ],
  },

  resolve: {
    alias: {
      PUBLIC_DIR: path.resolve(__dirname, "../../public"),
      ASSETS_DIR: path.resolve(__dirname, "./public"),
      SRC_DIR: path.resolve(__dirname, "./src"),
      PACKAGE_FILE: path.resolve(__dirname, "./package.json"),
      COMMON_DIR: path.resolve(__dirname, "../common"),
      "@docspace/shared": path.resolve(__dirname, "../shared"),
      "@docspace/ui-kit": path.resolve(__dirname, "../../libs/ui-kit"),
      "PUBLIC_DIR/scripts/config.json": path.resolve(
        __dirname,
        "../shared/__mocks__/configMock.js",
      ),
      "react-i18next": path.resolve(
        __dirname,
        "../shared/__mocks__/reacti18nextMock.tsx",
      ),
      "hex-rgb": path.resolve(__dirname, "../shared/__mocks__/hex-rgb.js"),
      "react-svg": path.resolve(
        __dirname,
        "../shared/__mocks__/reactSvgMock.tsx",
      ),
    },
  },

  esbuild: {
    target: "esnext",
  },
});
