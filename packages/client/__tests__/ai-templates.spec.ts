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
  aiTemplatesHandlers,
  AI_PROJECTS,
  AI_TEMPLATE_AGENTS,
  rootHandler,
  filesSettingsHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The Templates tab of the Agents list (`ai-agents-list` "Templates
 * catalog", "Installing a template"): the catalog of ASC.AI.Chat drawn as
 * cards, each in its own colour and cover, and an installation whose answer
 * carries warnings.
 */

const TEMPLATES_URL = "/ai-rooms/filter?tab=templates";

const cards = (page: Page) => page.getByTestId("ai-template-card");

const toast = (page: Page) => page.getByTestId("toast-content");

test.describe("AI Chat: Templates tab", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT, "owner"),
      aiConfigHandler(TEST_PORT),
      ...aiChatStoreHandlers(TEST_PORT),
      ...aiSectionsHandlers(TEST_PORT, [...AI_PROJECTS]),
    );
  });

  test("draws every template as a card in its own colour and cover", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(...aiTemplatesHandlers(TEST_PORT));

    await page.goto(`${baseUrl}${TEMPLATES_URL}`);

    await expect(cards(page)).toHaveCount(AI_TEMPLATE_AGENTS.length);
    for (const template of AI_TEMPLATE_AGENTS) {
      await expect(page.getByTestId("ai-templates-catalog")).toContainText(
        template.name,
      );
    }
    // A cover is drawn instead of the initials.
    await expect(
      cards(page).first().getByTestId("ai-project-logo").locator("svg"),
    ).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "ai-templates",
      "ai-templates-catalog.png",
    ]);
  });

  test("tells what an installation skipped instead of the plain confirmation", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      ...aiTemplatesHandlers(TEST_PORT, {
        warnings: ["instructionsNotSaved", "modelNotSaved"],
      }),
    );

    await page.goto(`${baseUrl}${TEMPLATES_URL}`);
    await cards(page).first().getByTestId("ai-template-install").click();
    await page.getByTestId("ai-template-install-confirm").click();

    const name = AI_TEMPLATE_AGENTS[0].name;
    await expect(toast(page)).toContainText(
      `${name} has been installed without the template's instructions`,
    );
    await expect(toast(page)).toContainText("could not be set");
    // Back on the My agents tab.
    await expect(page).not.toHaveURL(/tab=templates/);
  });

  test("confirms an installation that skipped nothing", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(...aiTemplatesHandlers(TEST_PORT, { warnings: [] }));

    await page.goto(`${baseUrl}${TEMPLATES_URL}`);
    await cards(page).first().getByTestId("ai-template-install").click();
    await page.getByTestId("ai-template-install-confirm").click();

    // The toast carries its own "Done" heading before the message.
    await expect(toast(page)).toContainText(
      `${AI_TEMPLATE_AGENTS[0].name} has been installed`,
    );
    await expect(toast(page)).not.toContainText("without");
    await expect(toast(page)).not.toContainText("could not be set");
  });
});
