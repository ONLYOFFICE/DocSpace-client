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


import {
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The JavaScript tab of a JavaScript SDK preset renders the sample through
 * @uiw/react-codemirror with `javascript()` and a GitHub theme.
 *
 * CodeMirror only applies extensions built against the same
 * @codemirror/state instance as the EditorState. When the `catalog:` in
 * pnpm-workspace.yaml pinned @codemirror/state and @codemirror/view below what
 * @codemirror/language and friends resolve to, the bundle carried two
 * instances, and the language and highlight style were dropped without an
 * error: the code showed as plain text. The same split cost ai-chat's MCP
 * config editor its JSON language.
 */

const PRESET_URL = "/developer-tools/javascript-sdk/docspace";
const FIRST_RENDER_TIMEOUT = 15_000;

test.beforeEach(async ({ mockRequest }) => {
  mockRequest.use(settingsHandler(TEST_PORT, TypeSettings.Authenticated));
});

test("highlights the JavaScript sample", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto(PRESET_URL);

  await page
    .getByText("Code to insert", { exact: true })
    .first()
    .click({ timeout: FIRST_RENDER_TIMEOUT });
  await page.getByText("JavaScript", { exact: true }).first().click();

  const editor = page.locator(".cm-editor").first();
  await expect(editor).toBeVisible();
  await expect(editor.locator(".cm-line").first()).toBeVisible();

  // highlighted tokens are spans inside a line; plain text has none
  await expect(editor.locator(".cm-line span").first()).toBeVisible();

  const colors = await editor
    .locator(".cm-line span")
    .evaluateAll(
      (spans) => new Set(spans.map((s) => getComputedStyle(s).color)).size,
    );
  expect(colors).toBeGreaterThan(1);
});
