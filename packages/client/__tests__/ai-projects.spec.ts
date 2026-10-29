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

import type { Page } from "@playwright/test";

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  aiConfigHandler,
  aiChatStoreHandlers,
  aiProjectsHandlers,
  AI_PROJECTS,
  AI_PROJECT_WITH_SOURCES,
  AI_PROJECT_WITHOUT_SOURCES,
  rootHandler,
  filesSettingsHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The AI Projects section: the list in its three views, the empty screens
 * of an admin and of a plain user, a project opened with its sources, and
 * the create dialog.
 *
 * The list is the stock one of the projects mock (three projects); the
 * project views open the first of them, which links Instructions and
 * Knowledge rooms, and the last, which links none.
 */

const PROJECTS_URL = "/ai-projects";
const VIEW_STORAGE_KEY = "aiProjectsViewAs";

const emptyView = (page: Page) =>
  page.getByTestId("empty-view").filter({ visible: true });

const rows = (page: Page) => page.getByTestId(/^ai-project-row-/);

/** Picks the list view the way the page remembers it between visits. */
const rememberView = (page: Page, view: "table" | "row" | "tile") =>
  page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [VIEW_STORAGE_KEY, view],
  );

test.describe("AI Projects", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      aiConfigHandler(TEST_PORT),
      ...aiChatStoreHandlers(TEST_PORT),
    );
  });

  test.describe("Empty section", () => {
    test("offers an admin to create a project", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiProjectsHandlers(TEST_PORT, []),
      );

      await page.goto(`${baseUrl}${PROJECTS_URL}`);

      await expect(emptyView(page)).toBeVisible();
      await expect(emptyView(page)).toContainText("No AI projects yet");
      await expect(emptyView(page)).toContainText("Create project");

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-projects-empty-admin.png",
      ]);
    });

    test("tells a user that nothing was shared with them", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "regular"),
        ...aiProjectsHandlers(TEST_PORT, []),
      );

      await page.goto(`${baseUrl}${PROJECTS_URL}`);

      await expect(emptyView(page)).toBeVisible();
      await expect(emptyView(page)).toContainText(
        "No projects shared with you yet",
      );
      await expect(emptyView(page)).not.toContainText("Create project");

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-projects-empty-user.png",
      ]);
    });

    test("opens the create dialog from the empty screen", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiProjectsHandlers(TEST_PORT, []),
      );

      await page.goto(`${baseUrl}${PROJECTS_URL}`);
      await expect(emptyView(page)).toBeVisible();

      await emptyView(page).getByText("Create project", { exact: true }).click();

      // The modal root is a zero-size wrapper; the aside's fields are what shows.
      await expect(page.getByTestId("ai-project-dialog")).toBeAttached();
      await expect(page.getByTestId("ai-project-title")).toBeVisible();
      await expect(page.getByTestId("ai-project-profile-combobox")).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-projects-create-dialog.png",
      ]);
    });

    test("creates a project with an uploaded picture and opens it", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiProjectsHandlers(TEST_PORT, []),
      );

      await page.goto(`${baseUrl}${PROJECTS_URL}`);
      await emptyView(page).getByText("Create project", { exact: true }).click();
      await page.getByTestId("ai-project-title").fill("Sales");

      // A picture goes through the icon's hidden file input into the crop
      // dialog, as a room's does; Save keeps the crop as the logo preview.
      const dialog = page.getByTestId("ai-project-dialog");
      await dialog.locator("input[type=file]").setInputFiles({
        name: "logo.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          "base64",
        ),
      });
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await expect(dialog.getByTestId("room-icon-image")).toBeVisible();

      await page.getByTestId("ai-project-submit").click();

      // The new project opens, with the picture as its logo.
      await expect(page).toHaveURL(/\/ai-projects\/777100$/);
      const intro = page.getByTestId("ai-project-intro");
      await expect(intro).toBeVisible();
      await expect(intro).toContainText("Sales");
      await expect(intro.getByTestId("room-icon-image")).toBeVisible();
    });
  });

  test.describe("List", () => {
    test.beforeEach(({ mockRequest }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiProjectsHandlers(TEST_PORT),
      );
    });

    test("renders the projects as a table", async ({ page, baseUrl }) => {
      await rememberView(page, "table");
      await page.goto(`${baseUrl}${PROJECTS_URL}`);

      await expect(rows(page)).toHaveCount(AI_PROJECTS.length);
      await expect(
        page.getByTestId(`ai-project-row-${AI_PROJECT_WITH_SOURCES.id}`),
      ).toContainText(AI_PROJECT_WITH_SOURCES.title);

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-projects-table.png",
      ]);
    });

    test("renders the projects as rows", async ({ page, baseUrl }) => {
      await rememberView(page, "row");
      await page.goto(`${baseUrl}${PROJECTS_URL}`);

      await expect(rows(page)).toHaveCount(AI_PROJECTS.length);

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-projects-rows.png",
      ]);
    });

    test("renders the projects as tiles", async ({ page, baseUrl }) => {
      await rememberView(page, "tile");
      await page.goto(`${baseUrl}${PROJECTS_URL}`);

      await expect(page.getByTestId("ai-projects-tiles")).toBeVisible();
      await expect(page.getByTestId(/^ai-project-tile-/)).toHaveCount(
        AI_PROJECTS.length,
      );

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-projects-tiles.png",
      ]);
    });

    test("narrows the list by the search, down to its own empty screen", async ({
      page,
      baseUrl,
    }) => {
      await rememberView(page, "table");
      await page.goto(`${baseUrl}${PROJECTS_URL}`);
      await expect(rows(page)).toHaveCount(AI_PROJECTS.length);

      const search = page.locator(
        '[data-testid="filter_search_input"] input, input[data-testid="filter_search_input"]',
      );
      await search.fill("Contract");
      await expect(rows(page)).toHaveCount(1);

      await search.fill("nothing like it");
      await expect(emptyView(page)).toBeVisible();
      await expect(emptyView(page)).toContainText("Clear filter");

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-projects-filter-empty.png",
      ]);
    });

    test("opens a project from the list", async ({ page, baseUrl }) => {
      await rememberView(page, "table");
      await page.goto(`${baseUrl}${PROJECTS_URL}`);

      await page
        .getByTestId(`ai-project-row-${AI_PROJECT_WITH_SOURCES.id}`)
        .getByText(AI_PROJECT_WITH_SOURCES.title, { exact: true })
        .click();

      await expect
        .poll(() => new URL(page.url()).pathname)
        .toBe(`${PROJECTS_URL}/${AI_PROJECT_WITH_SOURCES.id}`);
      await expect(page.getByTestId("ai-project-intro")).toBeVisible();
    });
  });

  test.describe("Project", () => {
    test.beforeEach(({ mockRequest }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiProjectsHandlers(TEST_PORT),
      );
    });

    test("shows the chat with the project's skills and knowledge", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${PROJECTS_URL}/${AI_PROJECT_WITH_SOURCES.id}`);

      const intro = page.getByTestId("ai-project-intro");
      await expect(intro).toBeVisible();
      await expect(intro).toContainText(AI_PROJECT_WITH_SOURCES.title);

      const instructions = page.getByTestId("ai-project-instructions");
      await expect(instructions).toBeVisible();
      for (const room of AI_PROJECT_WITH_SOURCES.aiProject.instructionsRooms) {
        await expect(instructions).toContainText(room.title);
      }

      const knowledge = page.getByTestId("ai-project-knowledge");
      await expect(knowledge).toBeVisible();
      for (const room of AI_PROJECT_WITH_SOURCES.aiProject.knowledgeRooms) {
        await expect(knowledge).toContainText(room.title);
      }

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-project-with-sources.png",
      ]);

      // Every file of an expanded room is listed with its state: the failed
      // one carries the badge with "Try again", and the room row a warning.
      const [room] = AI_PROJECT_WITH_SOURCES.aiProject.knowledgeRooms;
      await page.getByTestId(`ai-project-room-expander-${room.id}`).click();
      await expect(knowledge.getByTestId(/^ai-project-file-row-/)).toHaveCount(4);
      await expect(knowledge).toContainText("In progress");
      await expect(
        page.getByTestId(`ai-project-room-warning-${room.id}`),
      ).toBeVisible();
      const failed = page.getByTestId("ai-project-file-failed-779104");
      await expect(failed).toBeVisible();
      await failed.hover();
      await expect(page.getByText("Try again", { exact: true })).toBeVisible();
    });

    test("hides the source cards of a project without linked rooms", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(
        `${baseUrl}${PROJECTS_URL}/${AI_PROJECT_WITHOUT_SOURCES.id}`,
      );

      await expect(page.getByTestId("ai-project-intro")).toBeVisible();
      await expect(page.getByTestId("ai-project-instructions")).toHaveCount(0);
      await expect(page.getByTestId("ai-project-knowledge")).toHaveCount(0);

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-project-without-sources.png",
      ]);
    });

    test("tells about a project that is gone", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${PROJECTS_URL}/999999`);

      // The server's text, as a toast; no chat opens for it.
      await expect(page.getByTestId("toast-content")).toBeVisible();
      await expect(page.getByTestId("toast-content")).toContainText(
        "The project was not found.",
      );
      await expect(page.getByTestId("ai-project-intro")).toHaveCount(0);
    });
  });
});
