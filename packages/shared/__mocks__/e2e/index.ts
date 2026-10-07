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

import path from "node:path";
import { pathToFileURL } from "node:url";

// Every playwright.config.ts imports this module, so this runs in the runner's
// main process before any spec is loaded. Importing the stub installs the
// stylesheet hook here; NODE_OPTIONS hands it to the worker processes -- see
// node-css-stub.mjs for why the specs need that at all. Idempotent: workers
// import this module too and must not add the option a second time.
// `__dirname`, not `import.meta.url`: Playwright transpiles this file to
// CommonJS, and a reference to import.meta flips it to an ES module that then
// has no `exports`.
import "./node-css-stub.mjs";

const cssStubFlag = `--import=${pathToFileURL(path.join(__dirname, "node-css-stub.mjs")).href}`;

if (!(process.env.NODE_OPTIONS ?? "").includes(cssStubFlag)) {
  process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, cssStubFlag]
    .filter(Boolean)
    .join(" ");
}

export {
  createServerRequestInterceptor,
  setupAndResetHandlersServer,
} from "./mswRequestInterceptor";
export { createNextTestServer } from "./testServer";
export { PlaywrightWebSocketMock } from "./playwrightWebSocketMock";
export { expectScreenshot } from "./screenshots";

export * from "./utils";

export * from "./msw-compat";
