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
import { armTour, tourTooltip } from "./helpers/tour";

// packages/client/src/store/DashboardTourStore.ts
const TOUR_KEY = "dashboard_tour_pending";
const DASHBOARD_URL = "/dashboard";
const WELCOME_TAKE_TOUR = '[data-testid="dashboard-welcome-take-tour"]';

/**
 * The dashboard's profile card, which the tour opens on. Any anchor would do —
 * what is under test is the geometry every step is laid out with, not this step.
 */
const PROFILE_CARD = '[data-tour-id="dashboard-profile"]';

/**
 * How far down the page the section is pushed, standing in for the main bar.
 *
 * The bar (an unconfirmed email, a quota warning, a campaign) is what made this
 * break in the first place: everything below it starts that much further down
 * the viewport, the section's scroll container included, and react-joyride reads
 * a target's viewport top as though it were the target's offset inside that
 * container (`getScrollTo`, and its container-relative branch is switched off by
 * ui-kit's `Scrollbar`, whose `.scroller` always has `offsetTop === 0`). The
 * over-scroll that follows is exactly this height.
 *
 * Faked with a stylesheet rather than by mocking a bar into existence: the bars
 * come from half a dozen unrelated pieces of state, and none of that has
 * anything to do with what is asserted here.
 */
const BAR_HEIGHT = 100;

/**
 * The spotlight's cutout, in viewport coordinates.
 *
 * react-joyride draws it as an SVG path over the whole page (`modules/svg.ts`,
 * `generateSpotlightPath`), which starts at the cutout's top-left corner offset
 * by the corner radius — so the `M` command carries the rect's top.
 */
const cutoutTop = (page: Page) =>
  page.evaluate(() => {
    const paths = Array.from(
      document.querySelectorAll('[data-testid="spotlight"] path'),
    );
    const cutout = paths[paths.length - 1]?.getAttribute("d") ?? "";
    const top = Number(/^M[\d.]+ ([\d.]+)/.exec(cutout)?.[1] ?? Number.NaN);
    const svgTop =
      document
        .querySelector('[data-testid="spotlight"]')
        ?.getBoundingClientRect().top ?? 0;

    return top + svgTop;
  });

test.describe("Tour scrolling", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT, "admin"),
    );
  });

  test("keeps a step's anchor inside its scroll container", async ({
    page,
    baseUrl,
  }) => {
    // The regression: with a bar above the section the anchor was scrolled up
    // and out through the top of the scroll container, leaving the spotlight —
    // an SVG over the page, clipped by nothing — drawn over the bar with the
    // card it belongs to no longer on screen.
    await page.goto(`${baseUrl}${DASHBOARD_URL}`);
    await armTour(page, TOUR_KEY);
    // The pending flag `armTour` just set would start a tour on top of the
    // welcome; the modal's own button is what starts this one.
    await page.evaluate((key) => window.localStorage.removeItem(key), TOUR_KEY);
    await page.goto(`${baseUrl}${DASHBOARD_URL}`);

    await expect(page.locator(WELCOME_TAKE_TOUR)).toBeVisible();

    await page.addStyleTag({
      content: `.main-container { padding-top: ${BAR_HEIGHT}px; }`,
    });

    await page.locator(WELCOME_TAKE_TOUR).click();
    await expect(tourTooltip(page)).toBeVisible();
    // Let the step settle: the anchor is scrolled to from the step's `before`
    // hook, and joyride lays the spotlight out after that.
    await page.waitForTimeout(500);

    const anchor = await page.locator(PROFILE_CARD).boundingBox();
    const scroller = await page
      .locator(PROFILE_CARD)
      .evaluate((element) =>
        element.closest(".scroller")!.getBoundingClientRect().top,
      );

    expect(anchor).not.toBeNull();
    expect(anchor!.y).toBeGreaterThanOrEqual(scroller - 1);

    // And the spotlight is drawn around the anchor rather than around where the
    // anchor would have been, give or take the step's spotlight padding.
    expect(Math.abs((await cutoutTop(page)) - anchor!.y)).toBeLessThanOrEqual(8);
  });
});
