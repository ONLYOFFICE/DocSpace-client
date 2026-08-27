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
  usersByType,
  type UserType,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * What a reader without the rights gets from Developer Tools.
 *
 * The rule these pin, which used to be a single "may open it" question and is
 * now two:
 *
 *  - the portal switch decides whether the section is offered at all. Limited
 *    to admins, it disappears for everyone below one - a feature that is
 *    switched off is absent, not closed (that half is covered by the matrix in
 *    dashboard-appearance.spec.ts);
 *  - rights decide only whether it opens. The cards, the descriptions and the
 *    documentation stay; the ways in say why they lead nowhere.
 *
 * Functional only - no screenshots - so this holds on a local run too.
 */

const DASHBOARD_URL = "/dashboard";
const DOCS_CONNECT_URL = "/developer-tools/docs-connect";

const DEVTOOLS_CARD = '[data-tour-id="dashboard-devtools"]';
const INTEGRATIONS_CARD = '[data-tour-id="dashboard-integrations"]';
/** One of the tiles that leads inside the section rather than to a doc site. */
const EMBED_SDK_TILE = '[data-testid="dashboard-devtool-embed-sdk"]';
/** The REST API tile, which points at the public documentation site. */
const REST_API_TILE = '[data-testid="dashboard-devtool-rest-api"]';

const ACCESS_NOTICE = '[data-testid="docs_connect_access_notice"]';
const CREATE_INSTANCE_BUTTON =
  '[data-testid="docs_connect_create_tenant_button"]';

// packages/client/src/store/DashboardTourStore.ts — spent up front so the
// welcome does not sit over the page.
const welcomeKey = (userId: string) => `dashboard_welcome_seen_${userId}`;

const openDashboard = async (
  page: Page,
  baseUrl: string,
  userType: UserType,
) => {
  await page.addInitScript((key: string) => {
    window.localStorage.setItem(key, "true");
  }, welcomeKey(usersByType[userType].id));

  await page.goto(`${baseUrl}${DASHBOARD_URL}`);
  await expect(page.locator('[data-tour-id="dashboard-create"]')).toBeVisible();
};

const mockPortal = (userType: UserType) => [
  settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
  selfByTypeHandler(TEST_PORT, userType),
  selfActivationStatusHandler(TEST_PORT, null, false, true),
];

test.describe("Developer Tools without the rights", () => {
  test("a guest is shown the section and told why it does not open", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...mockPortal("visitor"));

    await openDashboard(page, baseUrl, "visitor");

    // The portal has the section switched on, so the guest reads what it is.
    await expect(page.locator(DEVTOOLS_CARD)).toBeVisible();
    await expect(page.locator(INTEGRATIONS_CARD)).toBeVisible();

    // Following a tile used to answer with a 403; now it says why instead, and
    // leaves the reader where they were.
    await page.locator(EMBED_SDK_TILE).click();

    await expect(page.getByText("Admin access required")).toBeVisible();
    await expect(
      page.getByText("This feature is available to admins only."),
    ).toBeVisible();
    expect(new URL(page.url()).pathname).toBe(DASHBOARD_URL);
  });

  test("the documentation tile is still a link for a guest", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // The refusal is about the section's own pages. A tile that points at the
    // public documentation is not one of them, so it stays a plain link - the
    // same reason the Docs Connect page keeps its API documentation link.
    mockRequest.use(...mockPortal("visitor"));

    await openDashboard(page, baseUrl, "visitor");

    await expect(page.locator(REST_API_TILE)).toHaveAttribute("href", /.+/);
  });

  test("a user opens Docs Connect and finds the action refused", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // The page opens for whoever the section opens for. Connecting an instance
    // is portal-wide, so that one action is refused with an explanation while
    // everything else on the page stays readable.
    mockRequest.use(...mockPortal("regular"));

    await page.goto(`${baseUrl}${DOCS_CONNECT_URL}`);

    await expect(page.locator(ACCESS_NOTICE)).toBeVisible();
    await expect(page.locator(ACCESS_NOTICE)).toContainText(
      "Only admins can configure Docs Connect",
    );
    await expect(page.locator(CREATE_INSTANCE_BUTTON)).toBeDisabled();

    // The documentation the notice promises is on the page and not disabled.
    const apiDocs = page.getByRole("link", { name: "Read API documentation" });
    await expect(apiDocs).toBeVisible();
    await expect(apiDocs).toHaveAttribute("href", /.+/);
  });

  test("an admin gets the page without the notice", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...mockPortal("admin"));

    await page.goto(`${baseUrl}${DOCS_CONNECT_URL}`);

    await expect(page.locator(CREATE_INSTANCE_BUTTON)).toBeEnabled();
    await expect(page.locator(ACCESS_NOTICE)).toHaveCount(0);
  });

  test("a guest is still kept out of the section by URL", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // Explaining the refusal on the dashboard is not the same as opening the
    // door: the route guard still bounces a guest who types the address.
    mockRequest.use(...mockPortal("visitor"));

    await page.goto(`${baseUrl}${DOCS_CONNECT_URL}`);

    await expect.poll(() => new URL(page.url()).pathname).toBe("/error/403");
  });
});
