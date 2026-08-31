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
  aiConfigHandler,
  roomListHandler,
  TypeRoomList,
  tariffHandler,
  freeQuotaHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The AI chat button in the section header.
 *
 * Three behaviours are pinned here, each of which has already regressed once:
 *
 *  - the label collapses to the bare icon ONLY when the header row has run out
 *    of space, never at a fixed breakpoint;
 *  - the collapsed/expanded state settles instead of oscillating (the width it
 *    is measured from must not itself be affected by collapsing);
 *  - the button sits flush against the header's trailing edge, on every device
 *    size.
 *
 * All assertions are geometric or functional - no screenshots - so they hold
 * on a local run as well as in Docker.
 */

const ROOMS_URL = "/rooms/shared/";

/** Desktop: the button lives in Navigation's right-hand button row. */
const DESKTOP = { width: 1440, height: 1024 };
/**
 * Below 1024 the trailing button row is dropped and the button joins the
 * control buttons instead. The header still has room for the label at this
 * width, so what the tablet frame pins is the move into the control buttons,
 * not a collapse.
 */
const TABLET = { width: 900, height: 800 };
/**
 * Narrow enough that the mobile header drops the share and plus buttons, which
 * frees up room again and brings the label back. Non-obvious, so it is pinned
 * rather than left to be rediscovered.
 */
const MOBILE = { width: 500, height: 800 };

const slot = (page: Page) => page.getByTestId("ai-chat-slot");
const button = (page: Page) => page.getByTestId("ai-chat-button");
const label = (page: Page) => button(page).getByText("AI Chat", { exact: true });
const header = (page: Page) => page.locator(".header-container");
/** Set by Home once the chat panel takes the whole main area over. */
const fullscreenLayout = (page: Page) =>
  page.locator('[data-layout-mode="ai-fullscreen"]');

/** Width the slot asks the header row for, i.e. the full labelled width. */
const requestedWidth = (page: Page) =>
  slot(page).evaluate((el) => parseFloat((el as HTMLElement).style.width || "0"));

const isCollapsed = async (page: Page) =>
  (await slot(page).getAttribute("data-collapsed")) === "true";

/**
 * Squeeze the header by narrowing the window, then let the ResizeObserver that
 * drives the collapse settle before reading anything back.
 */
const resize = async (page: Page, width: number, height = 900) => {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(250);
};

/**
 * Screenshots are clipped to the header row: the rest of the page carries
 * unrelated churn (room list, banners) that would make every unrelated change
 * look like a regression here.
 */
const shootHeader = async (page: Page, name: string) => {
  const box = await header(page).boundingBox();
  expect(box).not.toBeNull();
  await expectScreenshot(page, ["desktop", "ai-chat-header-button", name], {
    clip: box!,
  });
};

test.describe("AI chat header button", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT),
      aiConfigHandler(TEST_PORT),
      roomListHandler(TEST_PORT, TypeRoomList.ContextMenu),
    );
  });

  test("shows the labelled button next to the info panel toggle", async ({
    page,
    baseUrl,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(`${baseUrl}${ROOMS_URL}`);

    await expect(button(page)).toBeVisible();
    await expect(label(page)).toBeVisible();

    // Desktop pairs it with the info panel toggle, AI chat first.
    const toggle = page.locator("#info-panel-toggle--open");
    await expect(toggle).toBeVisible();

    const buttonBox = await button(page).boundingBox();
    const toggleBox = await toggle.boundingBox();
    expect(buttonBox).not.toBeNull();
    expect(toggleBox).not.toBeNull();
    expect(buttonBox!.x).toBeLessThan(toggleBox!.x);

    await shootHeader(page, "desktop-expanded.png");
  });

  test("keeps its distance to the info panel toggle when the panel opens", async ({
    page,
    baseUrl,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(`${baseUrl}${ROOMS_URL}`);

    const toggle = page.locator("#info-panel-toggle--open");
    await expect(button(page)).toBeVisible();
    await expect(toggle).toBeVisible();

    const gap = async () => {
      const b = await button(page).boundingBox();
      const t = await toggle.boundingBox();
      expect(b).not.toBeNull();
      expect(t).not.toBeNull();
      return t!.x - (b!.x + b!.width);
    };

    const closed = await gap();

    // Opening the info panel must not nudge the AI chat button sideways: the
    // toggle swaps a bare icon for a filled circle, and that used to change
    // its footprint and shove its neighbour along with it.
    await toggle.click();
    await page.waitForTimeout(400);
    const open = await gap();

    expect(
      Math.abs(open - closed),
      `gap moved from ${Math.round(closed)}px to ${Math.round(open)}px`,
    ).toBeLessThanOrEqual(1);
  });

  test("keeps the label while the header has room for it", async ({
    page,
    baseUrl,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(`${baseUrl}${ROOMS_URL}`);
    await expect(label(page)).toBeVisible();

    // A comfortable header must never minimise the button. This is the
    // regression guard for collapsing on a fixed width rather than on fit.
    for (const width of [1440, 1280, 1100]) {
      await resize(page, width);
      expect(
        await isCollapsed(page),
        `label must survive at ${width}px`,
      ).toBe(false);
      await expect(label(page)).toBeVisible();
    }
  });

  test("never collapses on a header that still has room", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // A free SaaS portal, so the tariff line is in the row too - this is the
    // fullest the rooms root header ever gets.
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      tariffHandler(TEST_PORT),
      freeQuotaHandler(TEST_PORT),
    );

    await page.setViewportSize(DESKTOP);
    await page.goto(`${baseUrl}${ROOMS_URL}`);
    await expect(label(page)).toBeVisible();

    // The whole range, in one sweep: the label has to survive all of it. This
    // is the guard against a collapse driven by a breakpoint instead of by
    // fit - any fixed width in the CSS or the component would show up as the
    // label vanishing at one of these steps while the row is still half empty.
    //
    // That the rooms root never runs out is not a weakness of the test, it is
    // the point: one short title, a 72px tariff line and ~110px of buttons fit
    // inside 328px. The other half of the contract - that the button DOES give
    // the label up once a row genuinely cannot hold it - needs a header under
    // real pressure and is pinned in room-header-crowding.spec.ts ("the chat
    // button gives up its label before its neighbours are cut"), against a
    // long room name in Russian with the info panel open.
    for (let width = 1400; width >= 360; width -= 40) {
      await resize(page, width);
      // The slot is briefly unmounted while the header swaps to its mobile
      // layout; a missing slot is not a collapsed one.
      if ((await slot(page).count()) === 0) continue;

      expect(
        await isCollapsed(page),
        `the label went away at ${width}px, where the header still has room for it`,
      ).toBe(false);
    }

    await expect(label(page)).toBeVisible();
    await expect(button(page)).toHaveAttribute("aria-label", "AI Chat");
  });

  test("settles instead of flickering while collapsed", async ({
    page,
    baseUrl,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(`${baseUrl}${ROOMS_URL}`);
    await expect(button(page)).toBeVisible();

    // Park the header in the collapse zone, then watch the state for a while.
    // The measured width must stay the full labelled width: if collapsing were
    // allowed to shrink it, the two states would alternate every frame.
    await resize(page, 620);

    const settledWidth = await requestedWidth(page);
    const samples: boolean[] = [];
    for (let i = 0; i < 12; i += 1) {
      samples.push(await isCollapsed(page));
      await page.waitForTimeout(100);
    }

    const flips = samples.filter((v, i) => i > 0 && v !== samples[i - 1]).length;
    expect(flips, `state changed ${flips} times while idle`).toBe(0);
    expect(await requestedWidth(page)).toBeCloseTo(settledWidth, 0);
  });

  test("stays flush with the header's trailing edge on tablet", async ({
    page,
    baseUrl,
  }) => {
    await page.setViewportSize(TABLET);
    await page.goto(`${baseUrl}${ROOMS_URL}`);

    await expect(button(page)).toBeVisible();

    const buttonBox = await button(page).boundingBox();
    const headerBox = await header(page).boundingBox();
    expect(buttonBox).not.toBeNull();
    expect(headerBox).not.toBeNull();

    // An always-rendered but empty right-hand button row used to reserve its
    // 20px inline-start margin here and push the button inwards.
    const trailingGap =
      headerBox!.x + headerBox!.width - (buttonBox!.x + buttonBox!.width);
    expect(
      trailingGap,
      `button sits ${Math.round(trailingGap)}px from the header's trailing edge`,
    ).toBeLessThanOrEqual(4);
    // Flush is not the same as hanging off the end: a negative gap means the
    // header is clipping the button, which used to pass this test unnoticed.
    expect(trailingGap).toBeGreaterThanOrEqual(0);

    // 900px is not the limit: the header has room to spare here, so the label
    // stays. It only genuinely has that room since the tablet grid stopped
    // handing the title every spare pixel - before that the control column sat
    // at its 90px minimum, the slot was squeezed to ~74px and the button was
    // sliced down its leading edge (see top-row-fit.spec.ts). Where the limit
    // actually is depends on the room name and the language, which is what the
    // narrowing test above measures rather than pinning a breakpoint.
    expect(await isCollapsed(page)).toBe(false);
    await shootHeader(page, "tablet-expanded.png");
  });

  test("brings the label back once the mobile header frees up room", async ({
    page,
    baseUrl,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(`${baseUrl}${ROOMS_URL}`);

    await expect(button(page)).toBeVisible();

    // Narrower than TABLET yet expanded again: the mobile header drops the
    // share and plus buttons, so the row genuinely has space for the label.
    // Pinned deliberately - if this ever needs to stay collapsed all the way
    // down, this is the test that should fail.
    expect(await isCollapsed(page)).toBe(false);
    await expect(label(page)).toBeVisible();

    await shootHeader(page, "mobile-expanded.png");
  });

  test("opens the chat panel docked, and the header button closes it", async ({
    page,
    baseUrl,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(`${baseUrl}${ROOMS_URL}`);

    await expect(slot(page)).toHaveAttribute("data-open", "false");

    await button(page).click();
    await expect(slot(page)).toHaveAttribute("data-open", "true");

    // On desktop the panel docks next to the section, so the header keeps its
    // width and the button stays reachable. Fullscreen is now only what the
    // user asks for through the panel's own toggle - the store no longer
    // forces it on for the settings page or the not-configured empty view.
    await expect(fullscreenLayout(page)).toHaveCount(0);

    await button(page).click();
    await expect(slot(page)).toHaveAttribute("data-open", "false");
  });

  test("the panel's own toggle takes the section over fullscreen", async ({
    page,
    baseUrl,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(`${baseUrl}${ROOMS_URL}`);

    await button(page).click();
    await expect(slot(page)).toHaveAttribute("data-open", "true");

    await page.getByTestId("ai-chat-panel-fullscreen").click();
    await expect(fullscreenLayout(page)).toBeAttached();

    // Fullscreen collapses the section - and with it this header - to zero
    // width, so the panel's own control is the only way back.
    await page.getByTestId("ai-chat-panel-close").click();
    await expect(slot(page)).toHaveAttribute("data-open", "false");
    await expect(fullscreenLayout(page)).toHaveCount(0);
  });
});
