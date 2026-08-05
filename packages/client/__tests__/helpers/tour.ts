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
 * Arms a section's tour the way the product does it.
 *
 * A tour is never shown on its own: the app's promo modal on the dashboard
 * requests it (its "Take a tour" button), and the section host starts it once
 * the section has loaded. `TourStore.requestTour` records the request under this
 * key so it survives the navigation to the section — which is exactly the hook
 * these specs use, instead of driving the dashboard promo, so each one stays
 * focused on the walkthrough it is about.
 *
 * `key` is the concrete store's key (e.g. `files_tour_pending`).
 */
export const armTour = async (page: Page, key: string) => {
  await page.evaluate(
    (storageKey) => window.localStorage.setItem(storageKey, "true"),
    key,
  );
};

// TourTooltip is the only dialog that renders a "current / total" progress
// counter (see TourTooltip.tsx `.progress`), so matching on that text is a
// stable way to grab it without relying on generated CSS module class names.
export const tourTooltip = (page: Page) =>
  page.locator('[role="dialog"]:visible').filter({ hasText: /\d+\s*\/\s*\d+/ });

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
    await expect(tooltip).toBeVisible();
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
