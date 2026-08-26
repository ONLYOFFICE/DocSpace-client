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

// The per-user "has been offered the welcome" flag
// (DashboardTourStore.welcomeKey). Only the prefix is known here: the suffix is
// the signed-in user's id, which differs per mocked user type — so the flag is
// spent through the UI rather than written by hand under a guessed key.
const WELCOME_SEEN_PREFIX = "dashboard_welcome_seen";

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

// Step titles, from public/locales/en/DashboardTour.json. By title rather than
// by index: the profile step is dropped whenever its card is absent, so an
// index would quietly point at a different step for half of these runs.
const PROFILE_STEP = "Your profile details";
const CREATE_STEP = "Create something now";
const OVERVIEW_STEP = "Coming back here";

/** The welcome modal, addressed by either of its two buttons. */
const welcomeDialog = (page: Page) => page.locator(WELCOME_TAKE_TOUR);

/**
 * Lands on the dashboard as a first-time user, with the clock fixed.
 *
 * Unlike the section tours there is nothing to arm: the welcome is shown by the
 * absence of the per-user "seen" flag, and the tour is requested from it on the
 * same page. So the first visit is only here to give `armTour` an origin to
 * write to — the storage it writes is the tour's pending flag, which this route
 * spends by itself and which every test below overrides anyway.
 */
const openDashboard = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${DASHBOARD_URL}`);
  await armTour(page, TOUR_KEY);
  // The pending flag `armTour` just set would start a tour on top of the
  // welcome; clear it so each test drives the modal the way a user does.
  await page.evaluate((key) => window.localStorage.removeItem(key), TOUR_KEY);
  await page.goto(`${baseUrl}${DASHBOARD_URL}`);
};

/** Lands on the dashboard and takes the tour from the welcome's own button. */
const startTour = async (page: Page, baseUrl: string) => {
  await openDashboard(page, baseUrl);

  await expect(welcomeDialog(page)).toBeVisible();
  await page.locator(WELCOME_TAKE_TOUR).click();

  await expect(tourTooltip(page)).toBeVisible();
};

/**
 * Spends the welcome offer for whoever is signed in, by closing the modal the
 * way a user would.
 *
 * Deliberately not a `localStorage.setItem`: the flag is keyed on the user id,
 * and the mocked user types do not share one — writing it by hand under a
 * guessed id leaves the real key unset, which shows up as a welcome that will
 * not go away rather than as a missing key. Letting the app write it keys the
 * flag correctly by construction.
 */
const markWelcomeSeen = async (page: Page) => {
  await expect(welcomeDialog(page)).toBeVisible();
  await page.locator(WELCOME_LATER).click();
  await expect(welcomeDialog(page)).toHaveCount(0);

  // The click only proves the modal closed; assert it also reached storage, so
  // a regression in the write surfaces here and not as a puzzling failure in
  // whatever the caller goes on to check.
  await expect
    .poll(() =>
      page.evaluate(
        (prefix) =>
          Object.keys(window.localStorage).some(
            (key) =>
              key.startsWith(`${prefix}_`) &&
              window.localStorage.getItem(key) === "true",
          ),
        WELCOME_SEEN_PREFIX,
      ),
    )
    .toBe(true);
};

/** Walks forward with the keyboard until the step titled `title` is up. */
const goToStep = async (page: Page, title: string, maxSteps = 8) => {
  const tooltip = tourTooltip(page);

  for (let i = 0; i < maxSteps; i += 1) {
    if (await tooltip.getByText(title, { exact: true }).isVisible()) return;
    await page.keyboard.press("ArrowRight");
    await expect(tooltip).toBeVisible();
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

    await expect(welcomeDialog(page)).toBeVisible();
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

  test("greets a first-time user", async ({ page, baseUrl }) => {
    await openDashboard(page, baseUrl);

    await expect(welcomeDialog(page)).toBeVisible();
    // Nothing runs until the offer is taken — the page behind the modal is what
    // the tour is about, and it is not being walked yet.
    await expect(tourTooltip(page)).toHaveCount(0);

    await expectScreenshot(page, ["desktop", "dashboard-tour", "welcome.png"]);
  });

  test("is offered once, whether or not the tour was taken", async ({
    page,
    baseUrl,
  }) => {
    await openDashboard(page, baseUrl);

    await expect(welcomeDialog(page)).toBeVisible();
    await page.locator(WELCOME_LATER).click();
    await expect(welcomeDialog(page)).toHaveCount(0);

    // "Has been offered the tour" is not "has taken the tour": walking out of
    // the modal spends the offer just as taking it does.
    await page.goto(`${baseUrl}${DASHBOARD_URL}`);
    await expect(page.locator(HELP_BUTTON)).toBeVisible();
    await expect(welcomeDialog(page)).toHaveCount(0);
  });

  test("the help button brings it back", async ({ page, baseUrl }) => {
    await openDashboard(page, baseUrl);
    await markWelcomeSeen(page);
    await page.goto(`${baseUrl}${DASHBOARD_URL}`);

    // A user who has already been offered the tour gets no modal of their own…
    await expect(page.locator(HELP_BUTTON)).toBeVisible();
    await expect(welcomeDialog(page)).toHaveCount(0);

    // …but the button in the corner is how they ask for it back, and the tour
    // it starts is the same one.
    await page.locator(HELP_BUTTON).click();
    await expect(welcomeDialog(page)).toBeVisible();

    await page.locator(WELCOME_TAKE_TOUR).click();
    await expect(tourTooltip(page)).toBeVisible();
    await goToStep(page, PROFILE_STEP);
  });

  test("closing a reopened welcome leaves the offer spent", async ({
    page,
    baseUrl,
  }) => {
    await openDashboard(page, baseUrl);
    await markWelcomeSeen(page);
    await page.goto(`${baseUrl}${DASHBOARD_URL}`);

    await page.locator(HELP_BUTTON).click();
    await expect(welcomeDialog(page)).toBeVisible();
    await page.locator(WELCOME_LATER).click();
    await expect(welcomeDialog(page)).toHaveCount(0);

    // Dismissing a modal that was asked for is a no-op on a flag that is
    // already spent — and it must not put the modal back on the next visit.
    await page.goto(`${baseUrl}${DASHBOARD_URL}`);
    await expect(page.locator(HELP_BUTTON)).toBeVisible();
    await expect(welcomeDialog(page)).toHaveCount(0);
  });
});
