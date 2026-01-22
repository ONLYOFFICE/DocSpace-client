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

import { expect, test, TEST_PORT } from "./fixtures/base";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  aiConfigHandler,
  rootHandler,
  filesSettingsHandler,
  agentFolderKnowledgeHandler,
} from "@docspace/shared/__mocks__/handlers";

test.describe("AI knowledge base", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT),
    );
  });

  // ================================== Portal admin ==================================

  test.describe("Portal admin", () => {
    test.beforeEach(async ({ mockRequest }) => {
      mockRequest.use(selfActivationStatusHandler(TEST_PORT, null, true, true));
    });

    test("should render knowledge page with vectorization is disabled empty screen (admin)", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        agentFolderKnowledgeHandler(TEST_PORT, "vectorizationDisabled"),
        aiConfigHandler(TEST_PORT, false, false, true),
      );

      await page.goto(`${baseUrl}/ai-agents/2?folder=2&searchArea=5`);

      const emptyView = await page.getByTestId("empty-view");

      await expect(emptyView).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-knowledge",
        "ai-knowledge-vectorization-disabled-empty-admin.png",
      ]);
    });

    test("should render knowledge page with empty screen", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        agentFolderKnowledgeHandler(TEST_PORT, "empty"),
        aiConfigHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/ai-agents/2?folder=2&searchArea=5`);

      const emptyView = await page.getByTestId("empty-view");

      await expect(emptyView).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-knowledge",
        "ai-knowledge-empty.png",
      ]);
    });

    test("should render knowledge files with completed vectorization", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        agentFolderKnowledgeHandler(TEST_PORT),
        aiConfigHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/ai-agents/2?folder=2&searchArea=5`);

      const tableRows = page.getByTestId(/table-row-/);

      await expect(tableRows).toHaveCount(3);

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-knowledge",
        "ai-knowledge-vectorization-completed.png",
      ]);
    });

    test("should render knowledge files with vectorization in progress", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        agentFolderKnowledgeHandler(TEST_PORT, "vectorizationInProgress"),
        aiConfigHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/ai-agents/2?folder=2&searchArea=5`);

      const tableRows = page.getByTestId(/table-row-/);

      await expect(tableRows).toHaveCount(3);

      const preparingForAIBadge = page.getByTestId("preparing-for-ai-badge");

      await preparingForAIBadge.last().hover();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-knowledge",
        "ai-knowledge-vectorization-in-progress.png",
      ]);
    });

    test("should render knowledge files with failed vectorization and ability to retry vectorization", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        agentFolderKnowledgeHandler(TEST_PORT, "vectorizationFailed"),
        aiConfigHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/ai-agents/2?folder=2&searchArea=5`);

      const tableRows = page.getByTestId(/table-row-/);

      await expect(tableRows).toHaveCount(3);

      const failedVectorizationBadge = page.getByTestId(
        "failed-vectorization-badge",
      );

      await failedVectorizationBadge.last().hover();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-knowledge",
        "ai-knowledge-vectorization-failed-can-retry.png",
      ]);

      const contextBtn = tableRows.first().getByTestId("context-menu-button");

      await contextBtn.click();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-knowledge",
        "ai-knowledge-vectorization-failed-context-menu-can-retry.png",
      ]);
    });

    test("should render knowledge files with failed vectorization and without ability to retry vectorization", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        agentFolderKnowledgeHandler(TEST_PORT, "vectorizationFailedNoRetry"),
        aiConfigHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/ai-agents/2?folder=2&searchArea=5`);

      const tableRows = page.getByTestId(/table-row-/);

      await expect(tableRows).toHaveCount(3);

      const failedVectorizationBadge = page.getByTestId(
        "failed-vectorization-badge",
      );

      await failedVectorizationBadge.last().hover();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-knowledge",
        "ai-knowledge-vectorization-failed-no-retry.png",
      ]);

      const contextBtn = tableRows.first().getByTestId("context-menu-button");

      await contextBtn.click();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-knowledge",
        "ai-knowledge-vectorization-failed-context-menu-no-retry.png",
      ]);
    });
  });

  // ================================== User ==================================

  test.describe("User", () => {
    test.beforeEach(({ mockRequest }) => {
      mockRequest.use(selfByTypeHandler(TEST_PORT, "regular"));
    });

    test("should render knowledge page with vectorization is disabled empty screen (user)", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        agentFolderKnowledgeHandler(TEST_PORT, "vectorizationDisabled"),
        aiConfigHandler(TEST_PORT, false, false, true),
      );

      await page.goto(`${baseUrl}/ai-agents/2?folder=2&searchArea=5`);

      const emptyView = await page.getByTestId("empty-view");

      await expect(emptyView).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-knowledge",
        "ai-knowledge-vectorization-disabled-empty-user.png",
      ]);
    });
  });
});
