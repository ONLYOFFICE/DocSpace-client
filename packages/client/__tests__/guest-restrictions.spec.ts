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
  usersByType,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * Why the Overview's create section is dead for a guest.
 *
 * Every control in it - the four quick actions and the "upload a file" link -
 * is rendered disabled, and a page of greyed-out controls with nothing to
 * explain them reads as broken rather than as restricted. The explanation is a
 * tooltip on each of them, which is what these tests pin.
 *
 * Worth its own coverage because the mechanism is quietly fragile: a disabled
 * button emits no mouse events, so the tooltip only works because the tile sets
 * `pointer-events: none` and the hover lands on the anchor wrapping it
 * (QuickActions.module.scss). Drop that line and the tooltip goes silent while
 * everything still looks right.
 */

const DASHBOARD_URL = "/dashboard";
const CREATE_SECTION = '[data-tour-id="dashboard-create"]';
const UPLOAD_LINK = "#dashboard-upload-link";

const TOOLTIP_TITLE = "Guests can't create or upload files.";
const TOOLTIP_DESCRIPTION =
  "Ask the Room or Full admin for additional permissions.";

// packages/client/src/store/DashboardTourStore.ts — spent up front so the
// welcome does not sit over the page.
const welcomeKey = (userId: string) => `dashboard_welcome_seen_${userId}`;

const tooltip = (page: Page) => page.getByText(TOOLTIP_TITLE);

const openDashboardAsGuest = async (page: Page, baseUrl: string) => {
  await page.addInitScript((key: string) => {
    window.localStorage.setItem(key, "true");
  }, welcomeKey(usersByType.visitor.id));

  await page.goto(`${baseUrl}${DASHBOARD_URL}`);
  await expect(page.locator(CREATE_SECTION)).toBeVisible();
};

test.describe("Guest restrictions on the create section", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfByTypeHandler(TEST_PORT, "visitor"),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
    );
  });

  test("a disabled tile explains itself on hover", async ({
    page,
    baseUrl,
  }) => {
    await openDashboardAsGuest(page, baseUrl);

    // Nothing is said until asked: the explanation is not on the page, which is
    // what makes the tooltip the only thing carrying it.
    await expect(tooltip(page)).toHaveCount(0);

    await page
      .getByRole("button", { name: "Document", exact: true })
      .hover({ force: true });

    await expect(tooltip(page)).toBeVisible();
    await expect(page.getByText(TOOLTIP_DESCRIPTION)).toBeVisible();
  });

  test("the upload link explains itself too", async ({ page, baseUrl }) => {
    // The link is the other half of the section's heading, and it is disabled by
    // a different mechanism (a semitransparent link with no handler), so its
    // tooltip is anchored separately and can break on its own.
    await openDashboardAsGuest(page, baseUrl);

    await page.locator(UPLOAD_LINK).hover({ force: true });

    await expect(tooltip(page)).toBeVisible();
  });

  test("shows the restriction where the reader is looking", async ({
    page,
    baseUrl,
  }) => {
    await openDashboardAsGuest(page, baseUrl);

    await page
      .getByRole("button", { name: "Document", exact: true })
      .hover({ force: true });
    await expect(tooltip(page)).toBeVisible();

    // Let the tooltip settle where it will stay before the frame is taken.
    await page.waitForTimeout(400);

    await expectScreenshot(page, [
      "desktop",
      "guest-restrictions",
      "create-section-tooltip.png",
    ]);
  });

  test("an ordinary user gets neither the restriction nor the tooltip", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // The other side of the rule: the same controls work for everyone else, so
    // hovering one says nothing at all.
    mockRequest.use(selfByTypeHandler(TEST_PORT, "regular"));

    await page.addInitScript((key: string) => {
      window.localStorage.setItem(key, "true");
    }, welcomeKey(usersByType.regular.id));
    await page.goto(`${baseUrl}${DASHBOARD_URL}`);
    await expect(page.locator(CREATE_SECTION)).toBeVisible();

    const document = page.getByRole("button", {
      name: "Document",
      exact: true,
    });
    await expect(document).toBeEnabled();

    await document.hover();
    await page.waitForTimeout(400);
    await expect(tooltip(page)).toHaveCount(0);
  });
});
