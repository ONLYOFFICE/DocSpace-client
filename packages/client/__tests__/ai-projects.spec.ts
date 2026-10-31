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
  aiSectionsHandlers,
  AI_HUB_ROOMS,
  AI_PROJECTS,
  AI_PROJECT_WITH_SOURCES,
  AI_PROJECT_WITHOUT_SOURCES,
  rootHandler,
  filesSettingsHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The two AI sections the server keeps under their own roots, drawn by Home
 * with the Rooms machinery:
 * - "AI rooms" (`/ai-rooms/*`): the Instructions and Knowledge rooms, their
 *   slots, the three-type create picker and a menu without archive;
 * - "AI Projects" (`/ai-projects/*`): the projects list, the empty screens,
 *   the project form, and a project opened with its sources.
 *
 * Every section list is a Files table; the project views open the first
 * stock project, which links Instructions and Knowledge rooms, and the last,
 * which links none.
 */

const AI_ROOMS_URL = "/ai-rooms/filter";
const PROJECTS_URL = "/ai-projects";

const projectUrl = (id: number) =>
  `${PROJECTS_URL}/${id}/filter?folder=${id}`;

const emptyView = (page: Page) =>
  page.getByTestId("empty-view").filter({ visible: true });

const table = (page: Page) => page.getByTestId("table-body");

const sidebar = (page: Page) => page.locator("#article-container");

/** A fresh copy of the stock projects: the create handler adds to its list. */
const stockProjects = () => [...AI_PROJECTS];

test.describe("AI sections", () => {
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

  test.describe("AI rooms", () => {
    test("lists the Instructions and Knowledge rooms with the section's slots", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiSectionsHandlers(TEST_PORT, stockProjects()),
      );

      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);

      await expect(table(page)).toBeVisible();
      for (const room of AI_HUB_ROOMS) {
        await expect(table(page)).toContainText(room.title);
      }

      // Both sections are in the sidebar; "AI rooms" has its own Recent,
      // Favorites and Trash and no Archive, "AI Projects" no slots at all.
      await expect(sidebar(page)).toContainText("AI rooms");
      await expect(sidebar(page)).toContainText("AI Projects");

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-rooms-table.png",
      ]);
    });

    test("offers no archive in a Knowledge room's menu", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiSectionsHandlers(TEST_PORT, stockProjects()),
      );

      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);
      await expect(table(page)).toBeVisible();

      const knowledgeRow = table(page)
        .locator("[data-testid^=table-row-]")
        .filter({ hasText: "Contracts archive" });
      await knowledgeRow.getByTestId("context-menu-button").first().click();

      // A room's menu keeps "Delete room" (outright, as the server deletes
      // an AI room) and has no "Move to Archive".
      await expect(page.locator("#option_delete")).toBeVisible();
      await expect(page.locator("#option_archive-room")).toHaveCount(0);
    });

    test("creates rooms from a picker of the three AI types", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiSectionsHandlers(TEST_PORT, stockProjects()),
      );

      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);
      await expect(table(page)).toBeVisible();

      await page.getByText("New room", { exact: true }).first().click();

      const types = page.getByTestId("room-type-list-item");
      await expect(types).toHaveCount(3);
      await expect(types.nth(0)).toContainText("Instructions");
      await expect(types.nth(1)).toContainText("Knowledge");
      await expect(types.nth(2)).toContainText("AI project");

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-rooms-create-picker.png",
      ]);

      // "AI project" leaves the room dialog for the project form.
      await types.nth(2).click();
      await expect(page.getByTestId("ai-project-dialog")).toBeAttached();
      await expect(page.getByTestId("ai-project-title")).toBeVisible();
    });

    test("offers an admin to create a room when the section is empty", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiSectionsHandlers(TEST_PORT, stockProjects(), []),
      );

      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);

      await expect(emptyView(page)).toBeVisible();
      await expect(emptyView(page)).toContainText("No AI rooms yet");
      await expect(emptyView(page)).toContainText("New room");

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-rooms-empty-admin.png",
      ]);
    });
  });

  test.describe("AI Projects, empty", () => {
    test("offers an admin to create a project", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiSectionsHandlers(TEST_PORT, []),
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
        ...aiSectionsHandlers(TEST_PORT, []),
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

    test("opens the project form from the empty screen", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiSectionsHandlers(TEST_PORT, []),
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
        ...aiSectionsHandlers(TEST_PORT, []),
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

      // The new project opens in its section, with the picture as its logo.
      await expect(page).toHaveURL(/\/ai-projects\/777100\/filter/);
      const intro = page.getByTestId("ai-project-intro");
      await expect(intro).toBeVisible();
      await expect(intro).toContainText("Sales");
      await expect(intro.getByTestId("room-icon-image")).toBeVisible();
    });
  });

  test.describe("AI Projects", () => {
    test.beforeEach(({ mockRequest }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiSectionsHandlers(TEST_PORT, stockProjects()),
      );
    });

    test("lists the projects as rooms", async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}${PROJECTS_URL}`);

      await expect(table(page)).toBeVisible();
      for (const project of AI_PROJECTS) {
        await expect(table(page)).toContainText(project.title);
      }

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-projects-table.png",
      ]);
    });

    test("opens a project from the list", async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}${PROJECTS_URL}`);
      await expect(table(page)).toBeVisible();

      await table(page)
        .getByText(AI_PROJECT_WITH_SOURCES.title, { exact: true })
        .click();

      await expect
        .poll(() => new URL(page.url()).pathname)
        .toBe(`${PROJECTS_URL}/${AI_PROJECT_WITH_SOURCES.id}/filter`);
      await expect(page.getByTestId("ai-project-intro")).toBeVisible();
    });

    test("shows the chat with the project's skills and knowledge", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${projectUrl(AI_PROJECT_WITH_SOURCES.id)}`);

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
      await page.goto(`${baseUrl}${projectUrl(AI_PROJECT_WITHOUT_SOURCES.id)}`);

      await expect(page.getByTestId("ai-project-intro")).toBeVisible();
      await expect(page.getByTestId("ai-project-instructions")).toHaveCount(0);
      await expect(page.getByTestId("ai-project-knowledge")).toHaveCount(0);

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-project-without-sources.png",
      ]);
    });
  });
});
