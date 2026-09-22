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
import { settingsAuth } from "@docspace/shared/__mocks__/handlers/settings/settings";

import { expect, test, TEST_PORT } from "./fixtures/base";
import type { UserType } from "@docspace/shared/__mocks__/handlers/people/self";

/**
 * The "Docs Admin Panel" entry in the sidebar profile menu.
 *
 * It is the one item in that menu that leads out of the portal, and it is
 * gated three ways at once - server (standalone) installation, full admin,
 * and a URL the backend actually published. Each gate is pinned separately
 * here, because dropping any one of them exposes the editors' admin panel to
 * someone who has no business there (a room admin, or every user of a SaaS
 * portal that has no such panel at all).
 */

const DASHBOARD_URL = "/dashboard";

const PROFILE_MENU_BUTTON = "profile_user_icon_button";
const DOCS_ADMIN_PANEL_ITEM = "user-menu-docs-admin-panel";
const SETTINGS_ITEM = "user-menu-settings";

/** What the backend publishes at externalResources.docs.adminPanel.domain. */
const DOCS_ADMIN_PANEL_URL = "https://docs.e2e.local/admin-panel/";

const externalResourcesWithPanel = {
  ...settingsAuth.response.externalResources,
  adminpanel: { domain: DOCS_ADMIN_PANEL_URL },
};

/**
 * @param type `Authenticated` is the standalone (server) payload;
 * `AuthenticatedNoStandalone` is the same portal running as SaaS.
 */
const mockPortal = (
  user: UserType,
  type: TypeSettings = TypeSettings.Authenticated,
  externalResources: unknown = externalResourcesWithPanel,
) => [
  settingsHandler(TEST_PORT, type, { externalResources }),
  selfByTypeHandler(TEST_PORT, user),
  selfActivationStatusHandler(TEST_PORT, null, false, true),
];

const openProfileMenu = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${DASHBOARD_URL}`);

  const profileButton = page.getByTestId(PROFILE_MENU_BUTTON);
  await expect(profileButton).toBeVisible();
  await profileButton.click();

  // The menu binds its outside-click listener when the open transition ends
  // (ContextMenu's `onEntered`), and `-enter-done` lands in the same phase.
  await expect(page.locator(".p-contextmenu-enter-done")).toBeVisible();
};

test.describe("Docs Admin Panel entry in the profile menu", () => {
  test("a full admin on a server portal gets it right under Settings", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...mockPortal("admin"));

    await openProfileMenu(page, baseUrl);

    const item = page.getByTestId(DOCS_ADMIN_PANEL_ITEM);
    await expect(item).toBeVisible();
    // The brand name comes from getBrandName("ProductEditorsName"), so the
    // label proves the placeholder was interpolated rather than printed.
    await expect(item).toContainText("Docs Admin Panel");

    // The href is what makes a middle-click and "copy link address" work; the
    // click itself is handled in JS (preventNewTab), which the next test covers.
    await expect(item.locator("a")).toHaveAttribute(
      "href",
      DOCS_ADMIN_PANEL_URL,
    );

    // Ordering: the entry sits below Settings, not somewhere further down.
    const items = page.locator(".p-menuitem[data-testid^='user-menu-']");
    const keys = await items.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-testid")),
    );
    expect(keys.indexOf(DOCS_ADMIN_PANEL_ITEM)).toBe(
      keys.indexOf(SETTINGS_ITEM) + 1,
    );
  });

  test("it opens the admin panel in a new tab", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...mockPortal("owner"));

    // The suite has no network: without a stub the new tab would sit on a
    // navigation that never resolves.
    await page
      .context()
      .route(`${DOCS_ADMIN_PANEL_URL}**`, (route) =>
        route.fulfill({ contentType: "text/html", body: "<html></html>" }),
      );

    await openProfileMenu(page, baseUrl);

    const popupPromise = page.waitForEvent("popup");

    await page.getByTestId(DOCS_ADMIN_PANEL_ITEM).click();

    const popup = await popupPromise;

    // toHaveURL rather than popup.url(): a freshly opened tab reports
    // about:blank until the navigation commits.
    await expect(popup).toHaveURL(DOCS_ADMIN_PANEL_URL);

    await popup.close();
  });

  test("a room admin gets no entry", async ({ page, baseUrl, mockRequest }) => {
    mockRequest.use(...mockPortal("roomAdmin"));

    await openProfileMenu(page, baseUrl);

    // The menu itself is there - it is this one row that must be missing.
    await expect(page.getByTestId("user-menu-profile")).toBeVisible();
    await expect(page.getByTestId(DOCS_ADMIN_PANEL_ITEM)).toHaveCount(0);
  });

  test("a SaaS portal has no entry even for the owner", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      ...mockPortal("owner", TypeSettings.AuthenticatedNoStandalone),
    );

    await openProfileMenu(page, baseUrl);

    await expect(page.getByTestId(SETTINGS_ITEM)).toBeVisible();
    await expect(page.getByTestId(DOCS_ADMIN_PANEL_ITEM)).toHaveCount(0);
  });

  test("a backend that publishes no URL gets no entry", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // What every portal looks like until the backend starts sending
    // externalResources.docs - a row pointing nowhere is worse than no row.
    mockRequest.use(
      ...mockPortal(
        "owner",
        TypeSettings.Authenticated,
        settingsAuth.response.externalResources,
      ),
    );

    await openProfileMenu(page, baseUrl);

    await expect(page.getByTestId(SETTINGS_ITEM)).toBeVisible();
    await expect(page.getByTestId(DOCS_ADMIN_PANEL_ITEM)).toHaveCount(0);
  });
});

