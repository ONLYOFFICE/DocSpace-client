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

import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { armTour, tourTooltip, walkTour } from "./helpers/tour";

// packages/client/src/store/FilesTourStore.ts
const TOUR_KEY = "files_tour_pending";
// My documents, from packages/shared/__mocks__/handlers/files/root.ts
const MY_DOCUMENTS_URL = "/rooms/personal/filter?folder=12764";

// The tour, step by step (FilesTour/tourSteps.ts): create tiles, AI chat, the
// New menu, search, a row's share button, the sidebar shortcuts.
const CREATE_STEP = 1;
const NEW_MENU_STEP = 3;
const SEARCH_STEP = 4;
const SHARE_STEP = 5;

// The dropdown MainButton opens, portalled to the body.
const NEW_MENU = ".p-contextmenu";
// The share button on the first row that has one — hidden until the row is
// hovered, which the tour's step stands in for.
const SHARE_BUTTON = '[data-testid^="table-row-"] .badge.copy-link';

/** Arms the tour and lands on the section that starts it by itself. */
const startTour = async (page: Page, baseUrl: string) => {
  // The first visit sets an origin so localStorage is reachable.
  await page.goto(`${baseUrl}${MY_DOCUMENTS_URL}`);
  await armTour(page, TOUR_KEY);
  await page.goto(`${baseUrl}${MY_DOCUMENTS_URL}`);

  await expect(tourTooltip(page)).toBeVisible();
};

/** Which step is up, read off the tooltip's own progress bar. */
const currentStep = (page: Page) =>
  tourTooltip(page).locator('[role="progressbar"]');

/** Walks forward with the keyboard until `step` is the one on screen. */
const goToStep = async (page: Page, step: number) => {
  for (let i = CREATE_STEP; i < step; i += 1) {
    await page.keyboard.press("ArrowRight");
  }

  await expect(currentStep(page)).toHaveAttribute(
    "aria-valuenow",
    String(step),
  );
};

test.describe("Files tour", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
    );
  });

  test("admin sees the full walkthrough", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "admin"));

    await startTour(page, baseUrl);

    await walkTour(page, ["desktop", "files-tour", "admin"]);
  });

  test("opens the New menu for its step and puts it away afterwards", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "admin"));

    await startTour(page, baseUrl);

    // Uploading lives in the New menu, so the step opens it — nothing else in
    // the tour clicks anything on the page.
    await expect(page.locator(NEW_MENU)).toBeHidden();

    await goToStep(page, NEW_MENU_STEP);

    await expect(page.locator(NEW_MENU)).toBeVisible();
    await expect(
      page.locator(NEW_MENU).getByText("Upload files").first(),
    ).toBeVisible();

    await page.keyboard.press("ArrowRight");

    await expect(currentStep(page)).toHaveAttribute(
      "aria-valuenow",
      String(SEARCH_STEP),
    );
    // Left open, it would sit on top of the next step's target.
    await expect(page.locator(NEW_MENU)).toBeHidden();
  });

  test("reveals the share button the row keeps hidden until hover", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "admin"));

    await startTour(page, baseUrl);

    // The regression this guards: the button is `display: none` outside
    // `:hover`, so the step pointing at it was dropped and never shown.
    await expect(page.locator(SHARE_BUTTON).first()).toBeHidden();

    await goToStep(page, SHARE_STEP);

    await expect(page.locator(SHARE_BUTTON).first()).toBeVisible();

    await page.keyboard.press("ArrowLeft");

    await expect(page.locator(SHARE_BUTTON).first()).toBeHidden();
  });

  test("walks with the arrow keys and survives a click on the backdrop", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "admin"));

    await startTour(page, baseUrl);

    await goToStep(page, 2);
    await page.keyboard.press("ArrowLeft");
    await expect(currentStep(page)).toHaveAttribute(
      "aria-valuenow",
      String(CREATE_STEP),
    );

    // A stray click beside the tooltip used to end the tour outright.
    await page.mouse.click(10, 10);

    await expect(tourTooltip(page)).toBeVisible();
    await expect(currentStep(page)).toHaveAttribute(
      "aria-valuenow",
      String(CREATE_STEP),
    );

    // Esc is still the keyboard way out.
    await page.keyboard.press("Escape");

    await expect(tourTooltip(page)).toBeHidden();
  });

  // There is no guest variant to walk here: a visitor hitting the personal
  // section at all is blocked at the access-control layer (the page renders
  // "Sorry, the resource is not currently accessible" instead of Home), which
  // is consistent with FilesTour/tourSteps.ts's own comment that guests are
  // normally out of this section's reach entirely. Regression-test that gate
  // instead of a walkthrough that cannot exist.
  test("guest cannot reach the personal section at all", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "visitor"));

    await page.goto(`${baseUrl}${MY_DOCUMENTS_URL}`);
    await armTour(page, TOUR_KEY);
    await page.goto(`${baseUrl}${MY_DOCUMENTS_URL}`);

    await expect(
      page.getByText("Sorry, the resource is not currently accessible."),
    ).toBeVisible();
    // Armed and still nothing runs: there is no section here to walk through.
    await expect(tourTooltip(page)).toBeHidden();
  });
});
