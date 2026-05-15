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

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  rootHandler,
  filesSettingsHandler,
  agentFolderInfoHandler,
  agentFolderResultStorageHandler,
} from "@docspace/shared/__mocks__/handlers";

test.describe("AI result storage", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT),
      selfActivationStatusHandler(TEST_PORT, null, true, true),
    );
  });

  test("should render empty result storage", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(agentFolderResultStorageHandler(TEST_PORT, "empty"));

    await page.goto(`${baseUrl}/ai-agents/2?folder=2&searchArea=6`);

    const emptyView = await page.getByTestId("empty-view");

    await expect(emptyView).toBeVisible();

    await expectScreenshot(page,[
      "desktop",
      "ai-result-storage",
      "ai-result-storage-default-empty.png",
    ]);
  });

  test("should navigate to chat from empty result storage", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(agentFolderResultStorageHandler(TEST_PORT, "empty"));

    await page.goto(`${baseUrl}/ai-agents/2?folder=2&searchArea=6`);

    const emptyView = await page.getByTestId("empty-view");

    await expect(emptyView).toBeVisible();

    const createChatBtn = emptyView.getByLabel("Create chat");
    await createChatBtn.click();

    await expect(page).toHaveURL((url) => url.pathname === "/ai-agents/2/chat");
  });

  test("should render empty result storage for user that can not use chat", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      agentFolderResultStorageHandler(TEST_PORT, "empty"),
      agentFolderInfoHandler(TEST_PORT, "canNotUseChat"),
    );

    await page.goto(`${baseUrl}/ai-agents/2?folder=2&searchArea=6`);

    const emptyView = await page.getByTestId("empty-view");

    await expect(emptyView).toBeVisible();

    const infoToast = await page.getByTestId("toast-content");

    await expect(infoToast).toBeVisible();
    await expect(infoToast).toContainText("Info");

    await expectScreenshot(page,[
      "desktop",
      "ai-result-storage",
      "ai-result-storage-empty-cannot-use-chat.png",
    ]);
  });

  test("should render result storage with files", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(agentFolderResultStorageHandler(TEST_PORT));

    await page.goto(`${baseUrl}/ai-agents/2?folder=2&searchArea=6`);

    const tableRows = page.getByTestId(/table-row-/);

    await expect(tableRows).toHaveCount(3);

    await expectScreenshot(page,[
      "desktop",
      "ai-result-storage",
      "ai-result-storage-with-files.png",
    ]);
  });

  test("should render result storage with files for user that cannot use chat", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      agentFolderResultStorageHandler(TEST_PORT),
      agentFolderInfoHandler(TEST_PORT, "canNotUseChat"),
    );

    await page.goto(`${baseUrl}/ai-agents/2?folder=2&searchArea=6`);

    const tableRows = page.getByTestId(/table-row-/);

    await expect(tableRows).toHaveCount(3);

    await expectScreenshot(page,[
      "desktop",
      "ai-result-storage",
      "ai-result-storage-with-files-cannot-use-chat.png",
    ]);
  });
});
