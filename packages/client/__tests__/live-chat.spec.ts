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
  rootHandler,
  filesSettingsHandler,
  myHandler,
  myDocumentsHandler,
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

/**
 * The Support launcher against the create button it shares the corner with.
 *
 * The launcher is an iframe Zendesk places itself, and the app only hands it an
 * offset - which Zendesk adds to the margin the frame already carries. Nothing
 * in the app's layout holds the two buttons on one line, so asking for the
 * create button's own inset left the launcher that margin higher, floating
 * above it. The stub below reproduces that placement, a frame pinned to the
 * corner with the vendor's margin, so the spec measures the corner the browser
 * actually shows. It models the widget, not Zendesk's code: were the vendor to
 * change that margin, the live widget would move and this spec would not
 * notice.
 */

const FILES_URL = "/rooms/personal/filter?folder=12764";

/** At or below 600px the app is in its mobile layout (ui-kit/utils/device). */
const MOBILE = { width: 428, height: 830 };

/** The margin Zendesk's own launcher frame carries, offsets added on top. */
const LAUNCHER_MARGIN_BLOCK = 10;
const LAUNCHER_MARGIN_INLINE = 20;

/** CreateButtonMobile on a phone: styles/variables/_floating-corner.scss. */
const CORNER_INSET_MOBILE = 16;
const CORNER_GAP = 16;

const CREATE_BUTTON = "main-button-mobile";
const LAUNCHER = "#launcher";

/**
 * Zendesk's CDN, answering with the launcher instead of the widget: a frame in
 * the corner carrying the vendor's margin, which the offsets we send are added
 * to. Only the calls that place it are honoured - the rest of the classic API
 * the component uses (locale, prefill, colors) is accepted and ignored.
 */
const stubZendeskLauncher = (page: Page) =>
  page.route(ZENDESK_SNIPPET_URL, (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `(() => {
        const launcher = document.createElement("iframe");
        launcher.id = "launcher";
        launcher.title = "Support";
        Object.assign(launcher.style, {
          position: "fixed",
          bottom: "0px",
          right: "0px",
          margin: "${LAUNCHER_MARGIN_BLOCK}px ${LAUNCHER_MARGIN_INLINE}px",
          width: "160px",
          height: "48px",
          border: "0",
          borderRadius: "24px",
          background: "royalblue",
          display: "none",
        });
        document.body.appendChild(launcher);

        window.zE = (product, command, payload) => {
          if (product !== "webWidget") return;
          if (command === "show") launcher.style.display = "block";
          if (command === "hide") launcher.style.display = "none";
          if (command === "updateSettings" && payload && payload.offset) {
            const { horizontal, vertical } = payload.offset;
            if (horizontal !== undefined) launcher.style.right = horizontal;
            if (vertical !== undefined) launcher.style.bottom = vertical;
          }
        };
      })();`,
    }),
  );

/** The widget only mounts for a portal that has live chat switched on. */
const withLiveChatOn = (page: Page) =>
  page.addInitScript(() => {
    window.localStorage.setItem("live_chat_state", "true");
  });

const openFilesOnAPhone = async (page: Page, baseUrl: string) => {
  await withLiveChatOn(page);
  await stubZendeskLauncher(page);
  await page.setViewportSize(MOBILE);

  await page.goto(`${baseUrl}${FILES_URL}`);

  const createButton = page.getByTestId(CREATE_BUTTON);
  const launcher = page.locator(LAUNCHER);

  await expect(createButton).toBeVisible();
  await expect(launcher).toBeVisible();

  return { createButton, launcher };
};

test.describe("Support launcher beside the create button", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      ...mockPortal(),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
    );
  });

  test("stands on the same line as the create button", async ({
    page,
    baseUrl,
  }) => {
    const { createButton, launcher } = await openFilesOnAPhone(page, baseUrl);

    const button = await createButton.boundingBox();
    const support = await launcher.boundingBox();
    expect(button).not.toBeNull();
    expect(support).not.toBeNull();
    if (!button || !support) return;

    // What the eye reads as "one level": the two rest on the same bottom edge.
    expect(Math.round(support.y + support.height)).toBe(
      Math.round(button.y + button.height),
    );

    // Both sit at the inset the stylesheet gives the create button, one gap
    // apart, so the launcher clears the button instead of covering it.
    expect(Math.round(MOBILE.height - (button.y + button.height))).toBe(
      CORNER_INSET_MOBILE,
    );
    expect(Math.round(MOBILE.width - (button.x + button.width))).toBe(
      CORNER_INSET_MOBILE,
    );
    expect(Math.round(button.x - (support.x + support.width))).toBe(CORNER_GAP);

    await expectScreenshot(page, [
      "mobile",
      "live-chat",
      "launcher-beside-create-button.png",
    ]);
  });

  test("takes the corner back when there is no create button", async ({
    page,
    baseUrl,
  }) => {
    const { createButton, launcher } = await openFilesOnAPhone(page, baseUrl);

    // The dashboard offers nothing to create, so the button unmounts and the
    // launcher has the corner to itself.
    await page.goto(`${baseUrl}${DASHBOARD_URL}`);
    await expect(createButton).toHaveCount(0);

    const support = await launcher.boundingBox();
    expect(support).not.toBeNull();
    if (!support) return;

    expect(Math.round(MOBILE.height - (support.y + support.height))).toBe(
      CORNER_INSET_MOBILE,
    );

    // Inline, the frame's own margin is a floor: an offset cannot be negative,
    // so 20px is as close to the edge as the widget goes. It lands there
    // instead of at the 16px the create button would have used.
    expect(Math.round(MOBILE.width - (support.x + support.width))).toBe(
      Math.max(CORNER_INSET_MOBILE, LAUNCHER_MARGIN_INLINE),
    );
  });
});
