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
 * The Zendesk launcher against the create button it shares the corner with.
 *
 * The launcher is an iframe the vendor places, so the app can only hand it an
 * offset - and it hands it the corner the create button is laid out from
 * (ui-kit's floating-corner numbers), one button further in while that button
 * is on screen. The stub below answers the CDN with a widget that only records
 * what it was asked, because the offset is the app's answer and the placing is
 * the vendor's.
 */

const FILES_URL = "/rooms/personal/filter?folder=12764";

/** At or below 600px the app is in its mobile layout (ui-kit/utils/device). */
const MOBILE = { width: 428, height: 830 };

/** The corner both are laid out from: _floating-corner.scss / FLOATING_CORNER_*. */
const CORNER_INSET_MOBILE = 16;
const CORNER_SIZE = 48;
const CORNER_GAP = 16;

const CREATE_BUTTON = "main-button-mobile";

type ZendeskCommand = { product: string; command: string; arg?: unknown };
type ZendeskOffset = { horizontal: number; vertical: number };

/** How Zendesk mounts its launcher: a 64px iframe pinned to the corner by inline style. */
const ZENDESK_LAUNCHER = "iframe#launcher";
const ZENDESK_LAUNCHER_SIZE = 64;

/**
 * Zendesk's CDN, answering with a widget that keeps a log instead of a UI,
 * plus the launcher frame as the vendor mounts it, for the stylesheet that
 * resizes it to act on. The suite has no network, and the commands are what
 * the app is judged by. The account serves the messaging widget, which throws
 * on the Web Widget (Classic) commands, so every one of them has to be a
 * `messenger` command.
 */
const stubZendeskRecorder = (page: Page) =>
  page.route(ZENDESK_SNIPPET_URL, (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `(() => {
        window.__zendeskCommands = [];
        window.zE = (product, command, arg) => {
          window.__zendeskCommands.push({ product, command, arg });
        };
        const launcher = document.createElement("iframe");
        launcher.id = "launcher";
        launcher.title = "Button to launch messaging window";
        launcher.setAttribute(
          "style",
          "height: ${ZENDESK_LAUNCHER_SIZE}px; width: ${ZENDESK_LAUNCHER_SIZE}px; " +
            "position: fixed; bottom: ${CORNER_INSET_MOBILE}px; right: ${CORNER_INSET_MOBILE}px; " +
            "border: 0; z-index: 999999;",
        );
        document.body.appendChild(launcher);
      })();`,
    }),
  );

/** Empty, rather than undefined, before the stub has answered - a poll right after a navigation lands there. */
const zendeskCommands = (page: Page) =>
  page.evaluate(
    () =>
      (window as unknown as { __zendeskCommands?: ZendeskCommand[] })
        .__zendeskCommands ?? [],
  );

/** `"messenger hide"`-style names, in the order the widget got them. */
const commandNames = (commands: ZendeskCommand[]) =>
  commands.map((c) => `${c.product} ${c.command}`);

/** Where the app last asked the launcher to stand. */
const lastOffset = (commands: ZendeskCommand[]) => {
  const placement = commands
    .filter(
      (c) => c.product === "messenger:set" && c.command === "customization",
    )
    .at(-1);

  return (
    placement?.arg as
      | { position: { offset: { web: ZendeskOffset } } }
      | undefined
  )?.position.offset.web;
};

/** The widget only goes up for a portal that has live chat switched on. */
const withLiveChatOn = (page: Page) =>
  page.addInitScript(() => {
    window.localStorage.setItem("live_chat_state", "true");
  });

const openFilesOnAPhone = async (page: Page, baseUrl: string) => {
  await withLiveChatOn(page);
  await stubZendeskRecorder(page);
  await page.setViewportSize(MOBILE);

  await page.goto(`${baseUrl}${FILES_URL}`);

  const createButton = page.getByTestId(CREATE_BUTTON);
  await expect(createButton).toBeVisible();

  return createButton;
};

test.describe("Zendesk launcher beside the create button", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      ...mockPortal(),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
    );
  });

  test("steps one button aside while the create button is on screen", async ({
    page,
    baseUrl,
  }) => {
    const createButton = await openFilesOnAPhone(page, baseUrl);

    // The create button stands at the corner inset...
    const button = await createButton.boundingBox();
    expect(button).not.toBeNull();
    if (!button) return;

    expect(Math.round(MOBILE.height - (button.y + button.height))).toBe(
      CORNER_INSET_MOBILE,
    );
    expect(Math.round(MOBILE.width - (button.x + button.width))).toBe(
      CORNER_INSET_MOBILE,
    );

    // ...and the launcher is asked to stand one button and a gap further in,
    // on the same line. The offset is sent once the stub has answered, so it
    // is polled for rather than read once.
    await expect
      .poll(async () => lastOffset(await zendeskCommands(page)))
      .toEqual({
        horizontal: CORNER_INSET_MOBILE + CORNER_SIZE + CORNER_GAP,
        vertical: CORNER_INSET_MOBILE,
      });
  });

  test("is drawn at the create button's size, on its line", async ({
    page,
    baseUrl,
  }) => {
    const createButton = await openFilesOnAPhone(page, baseUrl);

    const launcher = page.locator(ZENDESK_LAUNCHER);
    await expect(launcher).toBeVisible();

    const button = await createButton.boundingBox();
    const frame = await launcher.boundingBox();
    expect(button).not.toBeNull();
    expect(frame).not.toBeNull();
    if (!button || !frame) return;

    // Zendesk mounts a 64px frame and has no size setting; ui-kit's stylesheet
    // scales it to the corner's button size from the corner it is pinned to,
    // so the bottom edges meet and the two read as one row.
    expect(Math.round(frame.width)).toBe(CORNER_SIZE);
    expect(Math.round(frame.height)).toBe(CORNER_SIZE);
    expect(Math.round(frame.y + frame.height)).toBe(
      Math.round(button.y + button.height),
    );
  });

  test("takes the corner back when there is no create button", async ({
    page,
    baseUrl,
  }) => {
    const createButton = await openFilesOnAPhone(page, baseUrl);

    // The dashboard offers nothing to create, so the button unmounts and the
    // launcher has the corner to itself - at the same inset, still.
    await page.goto(`${baseUrl}${DASHBOARD_URL}`);
    await expect(createButton).toHaveCount(0);

    await expect
      .poll(async () => lastOffset(await zendeskCommands(page)))
      .toEqual({
        horizontal: CORNER_INSET_MOBILE,
        vertical: CORNER_INSET_MOBILE,
      });
  });

  test("leaves the launcher on screen and speaks the messaging API only", async ({
    page,
    baseUrl,
  }) => {
    await openFilesOnAPhone(page, baseUrl);

    await expect
      .poll(async () => lastOffset(await zendeskCommands(page)))
      .toBeDefined();

    const names = commandNames(await zendeskCommands(page));

    // The launcher is the only way into the chat, so nothing may hide it while
    // live chat is on.
    expect(names).not.toContain("messenger hide");
    expect(names.filter((name) => name.startsWith("webWidget"))).toEqual([]);
  });
});

/**
 * The profile menu switch on a phone.
 *
 * The mobile header builds its menu once, through a memo keyed on the store
 * action that builds it - and that action runs untracked, so the switch held
 * whatever it showed when the header first rendered. Live chat went off, the
 * widget went away, and the switch stayed lit, leaving no way back short of a
 * reload. The switch is what shows and hides the widget, so both halves are
 * pinned here, in the commands the widget is given.
 */

const MOBILE_AVATAR = "avatar";
const LIVE_CHAT_ROW = "user-menu-live-chat";

const openMobileProfileMenu = async (page: Page) => {
  await page.getByTestId(MOBILE_AVATAR).first().click();

  const row = page.getByTestId(LIVE_CHAT_ROW);
  await expect(row).toBeVisible();

  return row.getByTestId(TOGGLE);
};

test.describe("Live chat switch on a phone", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      ...mockPortal(),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
    );
  });

  test("the switch goes off and hides the widget", async ({ page, baseUrl }) => {
    await openFilesOnAPhone(page, baseUrl);

    const toggle = await openMobileProfileMenu(page);
    await expect(toggle).toHaveAttribute("aria-checked", "true");

    await toggle.click();

    // The widget goes, and the switch has to go with it - it is the only way
    // back to live chat.
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await expect
      .poll(async () => commandNames(await zendeskCommands(page)))
      .toContain("messenger hide");

    await expectScreenshot(page, [
      "mobile",
      "live-chat",
      "profile-menu-switch-off.png",
    ]);
  });

  test("the switch brings the widget back", async ({ page, baseUrl }) => {
    await openFilesOnAPhone(page, baseUrl);

    const toggle = await openMobileProfileMenu(page);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");

    await toggle.click();

    await expect(toggle).toHaveAttribute("aria-checked", "true");

    // Shown again, after the hide: the first switch-on loaded the widget and
    // the switch-off only hid it, so a `show` is all it takes.
    await expect
      .poll(async () => {
        const names = commandNames(await zendeskCommands(page));
        return names.lastIndexOf("messenger show") > names.lastIndexOf("messenger hide");
      })
      .toBe(true);
  });
});
