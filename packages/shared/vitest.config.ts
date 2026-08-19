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
    pool: process.env.POOL || "threads",

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
      "@docspace/shared": path.resolve(__dirname, "."),
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
