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
