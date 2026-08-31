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
  docsConnectHandlers,
  type UserType,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The dialogs behind "Already using another platform?" on the Overview.
 *
 * Each tile opens a walkthrough of connecting that platform: what it is, the
 * ordered steps to get there, and the one action that provisions an editors
 * instance. Four things decide what the dialog looks like, and each is pinned
 * below:
 *
 *  - which platform was clicked - the name, the subtitle and the steps are the
 *    platform's own;
 *  - whether the portal already has an instance, which ticks the first step off
 *    and turns "Create instance" into "Manage instance";
 *  - whether the reader may provision one at all - a room admin reads the same
 *    dialog with the action refused and a tooltip that says why, which is the
 *    half that has no other coverage;
 *  - "Your own platform", which has nothing to provision and collapses the
 *    footer to a link into the API reference.
 */

const DASHBOARD_URL = "/dashboard";
/**
 * The clock every frame is taken at.
 *
 * The tariff and Docs Connect mocks answer with fixed calendar dates, so
 * whether the portal reads as paid-up depends on where the real clock sits
 * relative to them - pinning "now" keeps these frames from quietly turning into
 * expired-subscription ones the day a date passes. Same instant the matrix in
 * dashboard-appearance.spec.ts uses.
 */
const FIXED_NOW = new Date("2026-02-10T12:00:00.000Z");

const INTEGRATIONS_CARD = '[data-tour-id="dashboard-integrations"]';
const tile = (platform: string) =>
  `[data-testid="dashboard-integration-${platform}"]`;
const createInstance = (platform: string) =>
  `[data-testid="integration-create-instance-${platform}"]`;
const docsApi = (platform: string) =>
  `[data-testid="integration-docs-api-${platform}"]`;

/**
 * The integration dialog, found through its own test id rather than by role
 * alone: the page keeps other dialogs mounted (the quota warning, the wallet
 * top-up), and they answer to `[role="dialog"]` too. The id sits on the outer
 * container, so the role picks the dialog box itself out of it.
 */
const dialog = (page: Page, platform: string) =>
  page.locator(
    `[data-testid="integration-dialog-${platform}"] [role="dialog"]`,
  );
const steps = (page: Page) => page.locator('[data-testid="integration-step"]');

// packages/client/src/store/DashboardTourStore.ts — spent up front so the
// welcome does not sit over the page.
const welcomeKey = (userId: string) => `dashboard_welcome_seen_${userId}`;

const openDashboard = async (
  page: Page,
  baseUrl: string,
  userType: UserType,
) => {
  await page.clock.setSystemTime(FIXED_NOW);
  await page.addInitScript((key: string) => {
    window.localStorage.setItem(key, "true");
  }, welcomeKey(usersByType[userType].id));

  await page.goto(`${baseUrl}${DASHBOARD_URL}`);
  await expect(page.locator(INTEGRATIONS_CARD)).toBeVisible();
};

/** Opens one platform's dialog and waits for it to settle. */
const openDialog = async (page: Page, platform: string) => {
  await page.locator(tile(platform)).click();
  await expect(dialog(page, platform)).toBeVisible();
};

const mockPortal = (userType: UserType) => [
  settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
  selfByTypeHandler(TEST_PORT, userType),
  selfActivationStatusHandler(TEST_PORT, null, false, true),
];

test.describe("Integration dialogs", () => {
  test("walks an admin through connecting a platform", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...mockPortal("admin"));

    await openDashboard(page, baseUrl, "admin");
    await openDialog(page, "nextcloud");

    await expect(dialog(page, "nextcloud")).toContainText("Nextcloud");
    // Creating the instance is step one, and on a portal without one it is not
    // ticked off - which is what the button below offers to change.
    await expect(steps(page).first()).toBeVisible();
    await expect(page.locator(createInstance("nextcloud"))).toBeEnabled();

    await expectScreenshot(page, [
      "desktop",
      "integrations",
      "nextcloud-admin.png",
    ]);
  });

  test("offers to manage the instance once the portal has one", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // The dialog can see the state of exactly one of its steps, and this is it:
    // with an instance already provisioned the first step reads as done and the
    // action changes from creating to managing.
    mockRequest.use(
      ...mockPortal("admin"),
      ...docsConnectHandlers(TEST_PORT, "paid"),
    );

    await openDashboard(page, baseUrl, "admin");
    await openDialog(page, "nextcloud");

    await expect(page.locator(createInstance("nextcloud"))).toHaveText(
      "Manage instance",
    );

    await expectScreenshot(page, [
      "desktop",
      "integrations",
      "nextcloud-with-instance.png",
    ]);
  });

  test("refuses the action to a room admin and says why", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // Provisioning an instance is portal-wide, so a room admin reads the whole
    // dialog with that one action disabled. The tooltip is the only place that
    // explains it, so it is opened rather than assumed.
    mockRequest.use(...mockPortal("roomAdmin"));

    await openDashboard(page, baseUrl, "roomAdmin");
    await openDialog(page, "nextcloud");

    await expect(page.locator(createInstance("nextcloud"))).toBeDisabled();

    await page.locator(createInstance("nextcloud")).hover({ force: true });
    await expect(
      page.getByText("You don't have enough permission"),
    ).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "integrations",
      "nextcloud-room-admin.png",
    ]);
  });

  test("sends anyone with their own platform to the API reference", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // "Your own platform" has no connector to install and nothing to provision,
    // so the footer collapses to a single way out: the API documentation.
    mockRequest.use(...mockPortal("admin"));

    await openDashboard(page, baseUrl, "admin");
    await openDialog(page, "custom");

    await expect(page.locator(docsApi("custom"))).toBeVisible();
    await expect(page.locator(createInstance("custom"))).toHaveCount(0);

    await expectScreenshot(page, [
      "desktop",
      "integrations",
      "own-platform.png",
    ]);
  });

  test("each tile opens its own platform", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // The card is a grid of tiles that all open the same component, so the one
    // thing worth checking across them is that each carries its own platform
    // through - a shared piece of state here would show every reader Nextcloud.
    mockRequest.use(...mockPortal("admin"));

    await openDashboard(page, baseUrl, "admin");

    for (const [platform, name] of [
      ["owncloud", "ownCloud"],
      ["confluence", "Confluence"],
      ["moodle", "Moodle"],
      ["n8n", "n8n"],
    ] as const) {
      await openDialog(page, platform);
      await expect(dialog(page, platform)).toContainText(name);

      await page.keyboard.press("Escape");
      await expect(dialog(page, platform)).toHaveCount(0);
    }
  });
});
