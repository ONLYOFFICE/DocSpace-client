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
import { expect } from "@playwright/test";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

/**
 * The moment every tour run is taken at.
 *
 * The stand-in entities a tour walks through are stamped with the wall clock
 * (`SRC_DIR/api/tourDemo/data` — `demoTimestamp`), so their `Last activity`
 * column renders whatever time the run happened at and every screenshot
 * disagrees with the one taken before it. The clock is set rather than the
 * column masked: the timestamp is part of what those rows look like, and the
 * date is the same shape as the fixed ones the list mocks already return.
 *
 * A run lasts seconds, so setting the clock to this instant is enough to pin
 * the rendered minute — the clock is deliberately not stopped, see `armTour`.
 */
const TOUR_FIXED_NOW = "2025-01-15T12:00:00.000Z";

/**
 * Arms a section's tour the way the product does it.
 *
 * A tour is never shown on its own: the app's promo modal on the dashboard
 * requests it (its "Take a tour" button), and the section host starts it once
 * the section has loaded. `TourStore.requestTour` records the request under this
 * key so it survives the navigation to the section — which is exactly the hook
 * these specs use, instead of driving the dashboard promo, so each one stays
 * focused on the walkthrough it is about.
 *
 * The clock is set here too: this is the one call every tour spec makes
 * between landing on an origin and navigating into the section the tour runs
 * in, which is the last moment before anything a screenshot covers is
 * rendered.
 *
 * `setSystemTime` rather than `setFixedTime`, and the difference is load-
 * bearing. Under `setFixedTime` the frame timers keep firing but `Date.now()`
 * is pinned, and joyride's scroll animation measures its own progress as
 * `(Date.now() - start) / duration` (`scroll@3` — the package behind
 * `scrollTo`). Pinned, that ratio is always 0, the frame loop never reaches
 * the end, and the promise joyride awaits before clearing its `scrolling`
 * flag never resolves. A step stuck mid-scroll renders neither the tooltip
 * (the lifecycle never leaves `TOOLTIP_BEFORE`) nor the spotlight cutout,
 * which shows up as a screenshot of nothing but the dimmed backdrop.
 *
 * `setSystemTime` starts the clock at the same instant instead of stopping it,
 * so `demoTimestamp` (SRC_DIR/api/tourDemo/data) still stamps the stand-in
 * rows deterministically while the few hundred milliseconds a scroll needs
 * still elapse.
 *
 * `key` is the concrete store's key (e.g. `files_tour_pending`).
 */
export const armTour = async (page: Page, key: string) => {
  await page.clock.setSystemTime(new Date(TOUR_FIXED_NOW));

  await page.evaluate(
    (storageKey) => window.localStorage.setItem(storageKey, "true"),
    key,
  );
};

// TourTooltip is the only dialog that carries a step-progress bar (see
// TourTooltip.tsx `.progress`, a dot per step), so matching on that role is a
// stable way to grab it without relying on generated CSS module class names.
export const tourTooltip = (page: Page) =>
  page
    .locator('[role="dialog"]:visible')
    .filter({ has: page.locator('[role="progressbar"]') });

/**
 * How long a step is given to come up.
 *
 * A step whose anchor has to be navigated to is laid out only once react-joyride
 * has waited it out, and joyride's own cap on that wait is
 * `JOYRIDE_TIMEOUTS.targetWaitTimeout` (SRC_DIR/components/Tour/useTour) —
 * 9s, well past the default expect timeout. Nothing is on screen while it
 * waits, so a shorter wait here reports a tour that is still coming as a tour
 * that is not there.
 */
const TOOLTIP_TIMEOUT = 10000;

/**
 * Clicks through every step of a running tour, screenshotting each one
 * before advancing. The step count isn't hard-coded here — it depends on the
 * audience/permission flags threaded into `getTourSteps`, so this walks
 * however many steps the running tour actually has (bailing out at
 * `maxSteps` as a safety net against an accidental infinite loop) and
 * returns the number of steps it saw.
 */
export const walkTour = async (
  page: Page,
  screenshotPath: string[],
  maxSteps = 20,
): Promise<number> => {
  const tooltip = tourTooltip(page);
  let step = 0;

  for (; step < maxSteps; step += 1) {
    await expect(tooltip).toBeVisible({ timeout: TOOLTIP_TIMEOUT });
    // Let the spotlight/tooltip finish positioning against the (possibly
    // just-scrolled-into-view) target before capturing.
    await page.waitForTimeout(300);
    await expectScreenshot(page, [
      ...screenshotPath,
      `step-${String(step + 1).padStart(2, "0")}.png`,
    ]);

    const doneButton = tooltip.getByRole("button", { name: "Done" });
    if (await doneButton.isVisible().catch(() => false)) {
      await doneButton.click();
      step += 1;
      break;
    }

    await tooltip.getByRole("button", { name: "Next" }).click();
  }

  await expect(tooltip).toBeHidden();
  return step;
};
