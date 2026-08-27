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
} from "@docspace/shared/__mocks__/handlers";

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * Bug 83459 - the "Live chat" switch in the sidebar profile menu.
 *
 * Two things went wrong at once when the unified sidebar replaced the article,
 * and each is pinned separately here:
 *
 *  - the switch never moved. The menu model is built by a MobX action, which
 *    runs untracked, so the wrapper has to observe the flag itself for the
 *    switch to repaint (AppsSidebar/ProfileBlock.tsx);
 *  - the Support chat never came up. The article was the only place that
 *    mounted the Zendesk widget, and nothing replaced it
 *    (AppsSidebar/LiveChatBlock.tsx). The snippet request is the evidence the
 *    widget is there at all.
 *
 * The switch and its frames need a portal that offers live chat: a Zendesk key
 * plus an owner, admin or room admin, per AuthStore.isLiveChatAvailable.
 */

const DASHBOARD_URL = "/dashboard";

const ZENDESK_KEY = "e2e-zendesk-key";
/** What ui-kit's Zendesk component loads: snippet.js from Zendesk's CDN. */
const ZENDESK_SNIPPET_URL = "**/ekr/snippet.js*";

const PROFILE_MENU_BUTTON = "profile_user_icon_button";
const LIVE_CHAT_ITEM = "user-menu-live-chat";
const TOGGLE = "toggle-button";
const TOAST = ".Toastify__toast";

// packages/client/src/store/DashboardTourStore.ts — spent up front so the
// welcome does not sit over the page.
const welcomeKey = (userId: string) => `dashboard_welcome_seen_${userId}`;

const mockPortal = () => [
  settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone, {
    zendeskKey: ZENDESK_KEY,
  }),
  selfByTypeHandler(TEST_PORT, "owner"),
  selfActivationStatusHandler(TEST_PORT, null, false, true),
];

/**
 * Answers the Zendesk CDN in place of the real one.
 *
 * The suite has no network, and a snippet that never arrives would leave the
 * widget half-initialised. An empty script is enough: what is under test is
 * that the request is made and that the switch tracks the store, not anything
 * Zendesk's own code does.
 */
const stubZendesk = (page: Page) =>
  page.route(ZENDESK_SNIPPET_URL, (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );

const openProfileMenu = async (page: Page, baseUrl: string) => {
  await page.addInitScript((key: string) => {
    window.localStorage.setItem(key, "true");
  }, welcomeKey(usersByType.owner.id));

  await page.goto(`${baseUrl}${DASHBOARD_URL}`);

  const profileButton = page.getByTestId(PROFILE_MENU_BUTTON);
  await expect(profileButton).toBeVisible();
  await profileButton.click();

  // The menu binds its outside-click listener when the open transition ends
  // (ContextMenu's `onEntered`), and `-enter-done` lands in the same phase.
  // Waiting for it keeps a click-away from arriving before anything listens.
  await expect(page.locator(".p-contextmenu-enter-done")).toBeVisible();

  const liveChatItem = page.getByTestId(LIVE_CHAT_ITEM);
  await expect(liveChatItem).toBeVisible();

  return liveChatItem.getByTestId(TOGGLE);
};

test.describe("Profile menu live chat switch", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(...mockPortal());
  });

  test("the switch turns on and stays on", async ({ page, baseUrl }) => {
    await stubZendesk(page);

    const toggle = await openProfileMenu(page, baseUrl);

    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await expectScreenshot(page, [
      "desktop",
      "live-chat",
      "switch-off.png",
    ]);

    await toggle.click();

    // The state the bug report opens on: one click, and the switch is on.
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await expect(page.locator(TOAST)).toContainText(
      "Live chat was successfully connected",
    );

    // The toast is waited out rather than captured with the switch: it dismisses
    // itself after 5s (Toastr.tsx DEFAULT_TIMEOUT) and clicking it away would
    // close the menu with it. Not hovered either - that pauses the timer.
    await expect(page.locator(TOAST)).toHaveCount(0, { timeout: 10_000 });
    await expectScreenshot(page, ["desktop", "live-chat", "switch-on.png"]);
  });

  test("the menu stays open across the switch and closes on a click away", async ({
    page,
    baseUrl,
  }) => {
    await stubZendesk(page);

    const toggle = await openProfileMenu(page, baseUrl);
    const menu = page.locator(".p-contextmenu");

    await toggle.click();

    // The menu used to close itself here: observing the store re-rendered the
    // menu, and ContextMenu read a re-render as "the menu went away". Closing on
    // a click outside is the behaviour that had to survive the fix.
    await expect(menu).toBeVisible();

    // Empty page area rather than a locator: the sidebar corner is covered by
    // the logo link, and following it would take the menu with it either way.
    await page.mouse.click(600, 300);

    await expect(menu).toHaveCount(0);
  });

  test("the switch turns back off", async ({ page, baseUrl }) => {
    await stubZendesk(page);

    const toggle = await openProfileMenu(page, baseUrl);

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");

    await toggle.click();

    await expect(toggle).toHaveAttribute("aria-checked", "false");
    // `.first()`: the toast container stacks newest-on-top (ui-kit Toast.tsx),
    // so the second notice is the first in the DOM.
    await expect(page.locator(TOAST).first()).toContainText(
      "Live chat was successfully disconnected",
    );
  });

  test("turning it on loads the Zendesk widget", async ({ page, baseUrl }) => {
    await stubZendesk(page);

    const snippetRequested = page.waitForRequest(ZENDESK_SNIPPET_URL);

    const toggle = await openProfileMenu(page, baseUrl);
    await toggle.click();

    const request = await snippetRequested;

    // The portal's own key, so the widget is the portal's rather than a stray
    // script that happens to match the URL.
    expect(request.url()).toContain(`key=${ZENDESK_KEY}`);
  });

  test("no live chat without a Zendesk key", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // A portal that never configured Zendesk has nothing to switch on, and the
    // menu must not offer the row at all - the same gate LiveChatBlock uses.
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone, {
        zendeskKey: "",
      }),
    );

    await page.addInitScript((key: string) => {
      window.localStorage.setItem(key, "true");
    }, welcomeKey(usersByType.owner.id));

    await page.goto(`${baseUrl}${DASHBOARD_URL}`);

    const profileButton = page.getByTestId(PROFILE_MENU_BUTTON);
    await expect(profileButton).toBeVisible();
    await profileButton.click();

    // Hotkeys stands for "the menu did open" - it is the row next to live chat
    // and the only gate it answers to is the desktop one.
    await expect(page.getByTestId("user-menu-hotkeys")).toBeVisible();
    await expect(page.getByTestId(LIVE_CHAT_ITEM)).toHaveCount(0);
  });
});
