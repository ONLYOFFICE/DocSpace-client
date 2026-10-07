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
  aiConfigHandler,
  freeQuotaHandler,
  selfActivationStatusHandler,
  selfByTypeHandler,
  settingsHandler,
  tariffHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The "Choose your upgrade path" dialog a standalone Community portal offers
 * its owner and admins from the Overview.
 *
 * dashboard-appearance.spec.ts only pins the line that opens it; this spec pins
 * the dialog itself. Its content does not depend on who opened it - only the
 * owner and full admins ever can - so one audience is enough, and the axis
 * that does change the frame is the width: the two solutions sit side by side
 * on a desktop and stack below the tablet breakpoint.
 *
 * What the dialog reads comes from the standalone /settings preset
 * (`externalResources.site`) and from /settings/payment
 * (`salesEmail`, requested when the dialog opens), so every link and both
 * trial buttons are live here.
 */

const DASHBOARD_URL = "/dashboard";

// See dashboard-appearance.spec.ts: the tariff mock's dates are fixed, so the
// clock is pinned to keep the portal on the plan the case is about.
const FIXED_NOW = new Date("2026-02-10T12:00:00.000Z");

test.use({ timezoneId: "UTC" });

const SITE = "https://www.onlyoffice.com/ru";

/**
 * The dialog's content box. `upgrade-path-dialog` is the modal's outer wrapper,
 * which has no box of its own (its backdrop is fixed), so it never reads as
 * visible - the content inside it does.
 */
const dialog = (page: Page) =>
  page.getByTestId("upgrade-path-dialog").getByTestId("modal-dialog");

type Viewport = {
  key: string;
  size: { width: number; height: number };
  /** Whether the two solutions sit in one row. */
  sideBySide: boolean;
  /** Whether the dialog is taller than the window, so its body scrolls. */
  scrolls: boolean;
};

const VIEWPORTS: Viewport[] = [
  {
    key: "desktop",
    size: { width: 1440, height: 1024 },
    sideBySide: true,
    scrolls: false,
  },
  // A laptop window is shorter than the dialog: the dialog is capped at the
  // window and its body scrolls between the header and the footer.
  {
    key: "laptop",
    size: { width: 1280, height: 720 },
    sideBySide: true,
    scrolls: true,
  },
  // Below the tablet breakpoint (`tablet-and-below`), where the grid drops to
  // one column and the modal turns into a bottom sheet.
  {
    key: "mobile",
    size: { width: 390, height: 844 },
    sideBySide: false,
    scrolls: true,
  },
];

/**
 * Replaces `window.open` with a recorder, so a trial button can be asserted on
 * the URL it opens without leaving the mocked origin.
 */
const recordWindowOpen = (page: Page) =>
  page.evaluate(() => {
    const opened: string[] = [];
    (window as unknown as { __opened: string[] }).__opened = opened;
    window.open = ((url?: string | URL) => {
      opened.push(String(url));
      return null;
    }) as typeof window.open;
  });

const readWindowOpen = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { __opened: string[] }).__opened ?? [],
  );

const openDialog = async (page: Page, baseUrl: string, viewport: Viewport) => {
  await page.setViewportSize(viewport.size);
  await page.clock.setSystemTime(FIXED_NOW);

  await page.goto(`${baseUrl}${DASHBOARD_URL}`);

  await page.getByTestId("dashboard-open-upgrade-path").click();
  await expect(dialog(page)).toBeVisible();
  // The purchase link waits for /settings/payment, which the dialog asks for
  // only once it opens - the frame is taken with it in place.
  await expect(page.getByTestId("upgrade-path-purchase-link")).toBeVisible();
};

for (const viewport of VIEWPORTS) {
  test(`Upgrade path dialog on ${viewport.key}`, async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfByTypeHandler(TEST_PORT, "owner"),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      tariffHandler(TEST_PORT, true),
      freeQuotaHandler(TEST_PORT),
      aiConfigHandler(TEST_PORT, false),
    );

    await openDialog(page, baseUrl, viewport);

    const enterprise = dialog(page).getByTestId("upgrade-path-enterprise");
    const developer = dialog(page).getByTestId("upgrade-path-developer");

    await expect(enterprise).toContainText("Docs Enterprise");
    await expect(developer).toContainText("Docs Developer");

    // Four features each: the Enterprise set, and Developer's own four with
    // the Enterprise set folded into the first of them.
    await expect(enterprise.getByText("AI tools", { exact: true })).toBeVisible();
    await expect(enterprise.getByText("Tech support", { exact: true })).toBeVisible();
    await expect(
      developer.getByText("Full Enterprise feature set", { exact: true }),
    ).toBeVisible();
    await expect(
      developer.getByText("API integration", { exact: true }),
    ).toBeVisible();

    // The trial links of the mockup's earlier draft, the Docker / Linux /
    // Windows instructions, belong to the Upgrade page and not here.
    await expect(dialog(page).getByText(/instructions/)).toHaveCount(0);

    await expect(
      dialog(page).getByText(
        "Please note that the editors will be unavailable during the upgrade.",
      ),
    ).toBeVisible();

    // The footer links, in the mockup's order, each pointing where it says.
    const links = dialog(page).locator('[data-testid^="upgrade-path-"][data-testid$="-link"]');
    await expect(links).toHaveCount(3);
    await expect(links.nth(0)).toHaveAttribute("href", `${SITE}/demo-order.aspx`);
    await expect(links.nth(1)).toHaveAttribute(
      "href",
      `${SITE}/support-contact-form`,
    );
    await expect(links.nth(2)).toHaveAttribute(
      "href",
      "mailto:sales@onlyoffice.com",
    );

    // The whole dialog fits the window - header on top, footer at the bottom -
    // and only the body scrolls. Without the cap a phone, where the modal is a
    // bottom sheet, pushed the header above the screen with nothing to scroll.
    // Polled: on a phone the sheet slides up from below the screen, so it is
    // measured once it has settled rather than mid-transition.
    await expect
      .poll(async () => {
        const box = await dialog(page).boundingBox();
        return (
          !!box &&
          box.y >= 0 &&
          box.y + box.height <= viewport.size.height + 1
        );
      })
      .toBe(true);
    await expect(
      dialog(page).getByText("Choose your upgrade path"),
    ).toBeInViewport();

    // Side by side on a desktop, stacked below the tablet breakpoint.
    const enterpriseBox = await enterprise.boundingBox();
    const developerBox = await developer.boundingBox();
    expect(enterpriseBox).not.toBeNull();
    expect(developerBox).not.toBeNull();
    if (viewport.sideBySide) {
      expect(Math.abs(enterpriseBox!.y - developerBox!.y)).toBeLessThan(2);
      expect(developerBox!.x).toBeGreaterThan(enterpriseBox!.x);
    } else {
      expect(Math.abs(enterpriseBox!.x - developerBox!.x)).toBeLessThan(2);
      expect(developerBox!.y).toBeGreaterThan(enterpriseBox!.y);
    }

    await expectScreenshot(page, [
      "desktop",
      "upgrade-path-dialog",
      `${viewport.key}.png`,
    ]);

    if (viewport.scrolls) {
      // The rest of the body - the second solution and the note - is below the
      // first frame; scroll it to the end and pin that in a second one.
      const body = dialog(page).locator(".modal-body");
      expect(
        await body.evaluate((el) => el.scrollHeight > el.clientHeight),
      ).toBe(true);
      await body.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      await expect(
        dialog(page).getByText("We recommend backing up your data before you start."),
      ).toBeInViewport();
      await expectScreenshot(page, [
        "desktop",
        "upgrade-path-dialog",
        `${viewport.key}-scrolled.png`,
      ]);
    }

    // Each trial button opens its own edition's download page on the site.
    await recordWindowOpen(page);
    await dialog(page).getByTestId("upgrade-path-enterprise-trial").click();
    await dialog(page).getByTestId("upgrade-path-developer-trial").click();
    expect(await readWindowOpen(page)).toEqual([
      `${SITE}/download#for-enterprises`,
      `${SITE}/download#for-developers`,
    ]);
  });
}
