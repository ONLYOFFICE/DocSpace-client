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
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { armTour, tourTooltip, walkTour } from "./helpers/tour";

// The Overview's integrations card is a Docs Connect surface, so it renders in
// SaaS only and its tour step is dropped on a standalone portal - which
// `TypeSettings.Authenticated` mocks. The full walkthrough these tests describe
// needs the SaaS variant.

// packages/client/src/store/DashboardTourStore.ts
const TOUR_KEY = "dashboard_tour_pending";
// The dashboard renders its own content — no list to fetch and no `folder`
// query param, unlike every section tour.
const DASHBOARD_URL = "/dashboard";

// packages/client/src/pages/Dashboard/sub-components/ProfileCard.tsx —
// dismissing the card is the one thing that changes which steps a tour has, and
// it lives in localStorage rather than in a store.
const PROFILE_CARD_HIDDEN_KEY = "dashboard_profile_card_hidden";

const WELCOME_TAKE_TOUR = '[data-testid="dashboard-welcome-take-tour"]';
const WELCOME_LATER = '[data-testid="dashboard-welcome-later"]';
const HELP_BUTTON = '[data-testid="dashboard-open-welcome"]';

// The page's own anchors (DashboardTour/tourSteps.ts), used to assert which
// steps a run can have rather than reading them off the tooltip.
const PROFILE_CARD = '[data-tour-id="dashboard-profile"]';

// Step titles, from packages/client/public/locales/en/DashboardTour.json. By title rather than
// by index: the profile step is dropped whenever its card is absent, so an
// index would quietly point at a different step for half of these runs.
const PROFILE_STEP = "Check your profile details";
const CREATE_STEP = "Start creating";
const OVERVIEW_STEP = "Come back anytime";

/** The welcome modal, addressed by either of its two buttons. */
const welcomeDialog = (page: Page) => page.locator(WELCOME_TAKE_TOUR);

/**
 * Lands on the dashboard with the clock fixed and nothing on top of the page.
 *
 * Unlike the section tours there is nothing to arm: the tour is requested from
 * the welcome on this same page. So the first visit is only here to give
 * `armTour` an origin to write to — the storage it writes is the tour's pending
 * flag, which this route spends by itself and which every test below clears.
 */
const openDashboard = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${DASHBOARD_URL}`);
  await armTour(page, TOUR_KEY);
  // The pending flag `armTour` just set would start a tour of its own; clear it
  // so each test drives the page the way a user does.
  await page.evaluate((key) => window.localStorage.removeItem(key), TOUR_KEY);
  await page.goto(`${baseUrl}${DASHBOARD_URL}`);
};

/** Opens the welcome from the help button — its only entry point. */
const openWelcome = async (page: Page) => {
  await expect(page.locator(HELP_BUTTON)).toBeVisible();
  await page.locator(HELP_BUTTON).click();
  await expect(welcomeDialog(page)).toBeVisible();
};

/** Lands on the dashboard and takes the tour from the welcome's own button. */
const startTour = async (page: Page, baseUrl: string) => {
  await openDashboard(page, baseUrl);

  await openWelcome(page);
  await page.locator(WELCOME_TAKE_TOUR).click();

  await expect(tourTooltip(page)).toBeVisible();
};

/**
 * Walks forward with the tour's own Next button until the step titled `title`
 * is up. Expects to be called at the start of a run, which is what both call
 * sites do.
 *
 * Deliberately not a keyboard walk probed with `isVisible()`. joyride keeps the
 * same dialog mounted between steps and swaps its body, so `toBeVisible()`
 * resolves instantly after a press and a one-shot read of the title can still
 * be looking at the step before — or, on the first step, at a tooltip that is
 * mounted but not yet painted. Each such miss costs an extra press, and a press
 * past the last step is not a no-op: `useTour`'s `controls.next()` completes the
 * tour and unmounts the tooltip, which then surfaces as a missing dialog rather
 * than as the overshoot it is.
 */
const goToStep = async (page: Page, title: string) => {
  const tooltip = tourTooltip(page);
  const progress = tooltip.locator('[role="progressbar"]');
  const step = tooltip.getByText(title, { exact: true });

  await expect(tooltip).toBeVisible();

  // The run's real length, off the progress bar, rather than a guess that can
  // outrun it.
  const size = Number(await progress.getAttribute("aria-valuemax"));


  for (let index = 1; index <= size; index += 1) {
    // The one real synchronisation point: TourTooltip renders the counter and
    // the title in the same commit, so once the counter has settled on this
    // step the read below is looking at that step's body.
    await expect(progress).toHaveAttribute("aria-valuenow", String(index));

    if ((await step.count()) > 0) {
      await expect(step).toBeVisible();
      return;
    }

    // Advance the way walkTour does. The last step offers Done rather than
    // Next, so there is nothing left to walk to.
    const next = tooltip.getByRole("button", { name: "Next" });
    if ((await next.count()) === 0) break;
    await next.click();
  }

  throw new Error(`step "${title}" never came up`);
};

test.describe("Dashboard tour", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
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

    await expect(page.locator(PROFILE_CARD)).toBeVisible();

    await walkTour(page, ["desktop", "dashboard-tour", "admin"]);
  });

  test("user sees the same walkthrough, profile step included", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // The card carries the reader's own details, so it is rendered for every
    // audience and the step that describes it is part of every run — what
    // differs between audiences is what the page behind the tour offers, not
    // which steps it has.
    mockRequest.use(selfByTypeHandler(TEST_PORT, "regular"));

    await startTour(page, baseUrl);

    await expect(page.locator(PROFILE_CARD)).toBeVisible();

    await walkTour(page, ["desktop", "dashboard-tour", "user"]);
  });

  test("guest sees the same walkthrough, profile step included", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "visitor"));

    await startTour(page, baseUrl);

    await expect(page.locator(PROFILE_CARD)).toBeVisible();

    await walkTour(page, ["desktop", "dashboard-tour", "guest"]);
  });

  test("drops the profile step when the card has been dismissed", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // The regression this guards: the card is dismissed into component state of
    // its own, which no store answers for — so the step list is read off the DOM
    // (DashboardTour `readFlags`). Somebody who has closed the card must not be
    // walked through a region that is not on their page.
    mockRequest.use(selfByTypeHandler(TEST_PORT, "admin"));

    await page.goto(`${baseUrl}${DASHBOARD_URL}`);
    await armTour(page, TOUR_KEY);
    await page.evaluate(
      ([tourKey, hiddenKey]) => {
        window.localStorage.removeItem(tourKey);
        window.localStorage.setItem(hiddenKey, "true");
      },
      [TOUR_KEY, PROFILE_CARD_HIDDEN_KEY],
    );
    await page.goto(`${baseUrl}${DASHBOARD_URL}`);

    await openWelcome(page);
    await page.locator(WELCOME_TAKE_TOUR).click();
    await expect(tourTooltip(page)).toBeVisible();

    await expect(page.locator(PROFILE_CARD)).toHaveCount(0);
    // The run opens on the quick actions instead, and the profile step never
    // comes up at all.
    await expect(
      tourTooltip(page).getByText(CREATE_STEP, { exact: true }),
    ).toBeVisible();
    await expect(
      tourTooltip(page).getByText(PROFILE_STEP, { exact: true }),
    ).toHaveCount(0);

    await walkTour(page, ["desktop", "dashboard-tour", "profile-dismissed"]);
  });

  test("ends on the sidebar rather than on an app card", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // The tour's job is to hand the user over to the four section tours, each
    // offered by its own app card — so it closes on the way back to this page
    // rather than on one of the apps it just described.
    mockRequest.use(selfByTypeHandler(TEST_PORT, "admin"));

    await startTour(page, baseUrl);
    await goToStep(page, OVERVIEW_STEP);

    // The last step is the last one: what it offers is "Done", not "Next".
    await expect(
      tourTooltip(page).getByRole("button", { name: "Done" }),
    ).toBeVisible();
  });
});

test.describe("Dashboard welcome", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT, "admin"),
    );
  });

  test("is never offered on its own, not even on a first visit", async ({
    page,
    baseUrl,
  }) => {
    // The regression this guards: the modal used to open by itself the first
    // time a user reached the dashboard. Landing on the page must interrupt
    // nobody — the tour is asked for, not proposed.
    await openDashboard(page, baseUrl);

    await expect(page.locator(HELP_BUTTON)).toBeVisible();
    await expect(welcomeDialog(page)).toHaveCount(0);
    await expect(tourTooltip(page)).toHaveCount(0);

    // Still nothing on a second visit: there is no deferred offer waiting to be
    // made, the way a "seen once" flag would leave one.
    await page.goto(`${baseUrl}${DASHBOARD_URL}`);
    await expect(page.locator(HELP_BUTTON)).toBeVisible();
    await expect(welcomeDialog(page)).toHaveCount(0);
  });

  test("the help button opens it", async ({ page, baseUrl }) => {
    await openDashboard(page, baseUrl);

    await openWelcome(page);
    // Nothing runs until the offer is taken — the page behind the modal is what
    // the tour is about, and it is not being walked yet.
    await expect(tourTooltip(page)).toHaveCount(0);

    await expectScreenshot(page, ["desktop", "dashboard-tour", "welcome.png"]);
  });

  test("the tour it starts is the dashboard's own", async ({
    page,
    baseUrl,
  }) => {
    await openDashboard(page, baseUrl);
    await openWelcome(page);

    await page.locator(WELCOME_TAKE_TOUR).click();
    await expect(tourTooltip(page)).toBeVisible();
    await goToStep(page, PROFILE_STEP);
  });

  test("closing it leaves the page as it was", async ({ page, baseUrl }) => {
    await openDashboard(page, baseUrl);
    await openWelcome(page);

    await page.locator(WELCOME_LATER).click();
    await expect(welcomeDialog(page)).toHaveCount(0);
    // Closing starts nothing, and the button that opened it is still there to
    // ask again with.
    await expect(tourTooltip(page)).toHaveCount(0);
    await expect(page.locator(HELP_BUTTON)).toBeVisible();

    await openWelcome(page);
  });
});
