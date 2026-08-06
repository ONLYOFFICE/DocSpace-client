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
  sharedWithMeHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { armTour, tourTooltip, walkTour } from "./helpers/tour";

// packages/client/src/store/FilesTourStore.ts
const TOUR_KEY = "files_tour_pending";
// My documents, from packages/shared/__mocks__/handlers/files/root.ts
const MY_DOCUMENTS_URL = "/rooms/personal/filter?folder=12764";
// Shared with me, from the same tree — the Files root of anyone without a
// personal space, which is every guest.
const SHARED_WITH_ME_URL = "/shared-with-me/filter?folder=4";

// The tour, step by step (FilesTour/tourSteps.ts): create tiles, AI chat, the
// New menu, search, a row's share button, the sidebar shortcuts.
const CREATE_STEP = 1;
const NEW_MENU_STEP = 3;
const SEARCH_STEP = 4;
const SHARE_STEP = 5;

// Who the stand-in shared files came from (SRC_DIR/api/tourDemo/data.ts) —
// proof that the list the tour is walking is the borrowed one rather than the
// guest's own empty section. The sharer rather than a file name: the demo names
// its files after what they are ("Document"), which the Type column says too.
const DEMO_SHARER = "colleague@example.com";
// The step that hands the stand-in list back, from
// public/locales/en/FilesTour.json.
const EMPTY_STEP = "Your list is empty for now";
// The empty screen the closing step points at.
const EMPTY_SCREEN = '[data-testid="empty-view"]';

// The dropdown MainButton opens, portalled to the body.
const NEW_MENU = ".p-contextmenu";
// The share button on the first row that has one — hidden until the row is
// hovered, which the tour's step stands in for.
const SHARE_BUTTON = '[data-testid^="table-row-"] .badge.copy-link';

/** Arms the tour and lands on the section that starts it by itself. */
const startTour = async (
  page: Page,
  baseUrl: string,
  url = MY_DOCUMENTS_URL,
) => {
  // The first visit sets an origin so localStorage is reachable.
  await page.goto(`${baseUrl}${url}`);
  await armTour(page, TOUR_KEY);
  await page.goto(`${baseUrl}${url}`);

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

/**
 * Walks forward with the keyboard until the step titled `title` is up.
 *
 * By title rather than by index, because which steps survive depends on what
 * the page has on it — an index would quietly point at a different step as
 * those flags move.
 */
const goToStepByTitle = async (page: Page, title: string, maxSteps = 10) => {
  const tooltip = tourTooltip(page);

  for (let i = 0; i < maxSteps; i += 1) {
    if (await tooltip.getByText(title, { exact: true }).isVisible()) return;
    await page.keyboard.press("ArrowRight");
    await expect(tooltip).toBeVisible();
  }

  throw new Error(`step "${title}" never came up`);
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

  // The guest walkthrough is not here but in "Files tour for a guest" below:
  // a visitor hitting the personal section is blocked at the access-control
  // layer (the page renders "Sorry, the resource is not currently accessible"
  // instead of Home), so their Files root — and their tour — is Shared with me.
  // Regression-test the gate here, and the walkthrough there.
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

test.describe("Files tour for a guest", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT, "visitor"),
      // Not part of the default set: its `files/:id` pattern would answer
      // folderHandler's requests too (see __mocks__/handlers/files/index.ts).
      sharedWithMeHandler(TEST_PORT),
    );
  });

  test("walks the Shared with me that stands in for their Files section", async ({
    page,
    baseUrl,
  }) => {
    await startTour(page, baseUrl, SHARED_WITH_ME_URL);

    await walkTour(page, ["desktop", "files-tour", "guest"]);
  });

  test("the list the guest already has is left alone", async ({
    page,
    baseUrl,
  }) => {
    // The stand-in files are only ever put up in place of an empty answer, so
    // a guest with something shared with them never sees a file they have not
    // been given.
    await startTour(page, baseUrl, SHARED_WITH_ME_URL);

    await expect(page.getByRole("main").getByText(DEMO_SHARER)).toHaveCount(0);
    await expect(
      page.getByRole("main").getByText("share test").first(),
    ).toBeVisible();
  });
});

test.describe("Files tour for a guest with nothing shared yet", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT, "visitor"),
      // Nothing shared with them at all — the case the stand-in list exists
      // for, and the one a brand-new guest actually lands on.
      sharedWithMeHandler(TEST_PORT, "empty"),
    );
  });

  test("walks a stood-in list instead of an empty section", async ({
    page,
    baseUrl,
  }) => {
    await startTour(page, baseUrl, SHARED_WITH_ME_URL);

    // Neither the row steps nor the filter bar would exist on the real
    // (empty) page — `isEmptyPage` takes the whole bar down with it.
    await expect(
      page.getByRole("main").getByText(DEMO_SHARER).first(),
    ).toBeVisible();

    await walkTour(page, ["desktop", "files-tour", "guest-empty"]);
  });

  test("hands the section back before the closing step", async ({
    page,
    baseUrl,
  }) => {
    await startTour(page, baseUrl, SHARED_WITH_ME_URL);
    await goToStepByTitle(page, EMPTY_STEP);

    // The step drops the stand-in files itself and says what will fill the
    // empty screen the reload brings up, rather than letting the section empty
    // out behind the user's back once the tour is over.
    await expect(page.locator(EMPTY_SCREEN)).toBeVisible();
    await expect(page.getByRole("main").getByText(DEMO_SHARER)).toHaveCount(0);
  });
});
