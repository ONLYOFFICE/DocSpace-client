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

import { defineConfig, Plugin } from "vitest/config";
import svgr from "vite-plugin-svgr";
import path from "path";

// Plugin to mock SVG ?url imports in tests
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
    // Test environment
    environment: "jsdom",

    // Setup files
    setupFiles: ["./vitest/setupTests.ts"],

    // Global test settings
    globals: true,
    clearMocks: true,

    // TypeScript configuration
    typecheck: {
      tsconfig: "./tsconfig.vitest.json",
    },

    // Coverage
    coverage: {
      enabled: false,
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
    },

    // Reporters
    reporters: ["default", "html"],
    outputFile: {
      html: "./vitest/reports/index.html",
    },

    // Timeout
    testTimeout: 70000,

    // Include/exclude patterns
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },

  resolve: {
    alias: {
      PUBLIC_DIR: path.resolve(__dirname, "../../public"),
      "PUBLIC_DIR/scripts/config.json": path.resolve(
        __dirname,
        "./__mocks__/configMock.js",
      ),
      "react-i18next": path.resolve(
        __dirname,
        "./__mocks__/reacti18nextMock.tsx",
      ),
      "hex-rgb": path.resolve(__dirname, "./__mocks__/hex-rgb.js"),
      "react-svg": path.resolve(__dirname, "./__mocks__/reactSvgMock.tsx"),
    },
  },

  esbuild: {
    target: "esnext",
  },
});
