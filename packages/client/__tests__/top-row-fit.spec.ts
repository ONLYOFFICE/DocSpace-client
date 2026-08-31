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

import { http } from "msw";

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { BASE_URL, API_PREFIX } from "@docspace/shared/__mocks__/e2e/utils";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  selfHandlerWithCulture,
  aiConfigHandler,
  roomListHandler,
  TypeRoomList,
  tariffHandler,
  freeQuotaHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The top row of the app - the sidebar's own header on the leading edge and the
 * section header next to it - and the two ways it was found to be laid out
 * wrong once the portal logo lost its "Docs" half and went from 177px to 130px
 * wide.
 *
 *  - The sidebar's collapse button was pinned to the trailing edge only by
 *    accident: `.header` asks for `space-between`, but ui-kit re-states
 *    `flex-start` for the same element inside its tablet media query and wins
 *    on specificity. With the old wordmark the logo happened to be almost
 *    exactly as wide as the row, so the button landed at the edge anyway. The
 *    narrower logo left it stranded ~50px short of it.
 *  - The AI chat button was being sliced down its leading edge at tablet
 *    widths. That one predates the logo change: from 1024px down the button
 *    moves into `.controlButtonContainer`, whose grid track is pinned at its
 *    `min-width` of 90px, and 16px of that goes to a gap. The slot is
 *    shrinkable and hides its overflow, so it silently gave up the 17px the
 *    label needed and clipped the button instead of collapsing it.
 *
 * The assertions are geometric or functional, so they hold on a local run as
 * well as in Docker. The frames at the end are the other half: both defects
 * were reported from a screenshot, and neither is expressible as a single
 * measurement - "the button drifted" and "the pill is cut" are things you see.
 * Those compare truthfully in Docker only (see `.claude/rules/e2e-tests.md`).
 */

const ROOMS_URL = "/rooms/shared/";

/** Above 1024: the sidebar is wide and the chat button sits in its own row. */
const DESKTOP = { width: 1440, height: 900 };
/**
 * The tablet band is 600.1px - 1023.9px (`libs/ui-kit/utils/device`). Three
 * widths across it, because the failure was reported at "tablet" without one.
 */
const TABLET_WIDTHS = [1000, 900, 700];
/** At or below 600px: no sidebar header at all, and a nav bar above the row. */
const MOBILE = { width: 500, height: 800 };

/**
 * One frame per device class, clipped to the top row - the file list under it
 * carries loading churn that has nothing to do with what these frames show.
 *
 * The heights are what the row actually occupies at each size, measured rather
 * than guessed, and each stops short of the first thing below it.
 */
const FRAMES = [
  {
    key: "desktop",
    viewport: DESKTOP,
    // Sidebar header (69px, the taller of the two) alongside the section
    // header; stops above the first sidebar item.
    clipHeight: 69,
  },
  {
    key: "tablet",
    viewport: { width: 900, height: 800 },
    // Both headers are 61px here, and this is the size both defects showed at.
    clipHeight: 61,
  },
  {
    key: "mobile",
    viewport: MOBILE,
    // The sidebar is a drawer and renders no header, so the row is the nav bar
    // (burger, centred logo, avatar) plus the section header below it.
    clipHeight: 104,
  },
];

const slot = (page: Page) => page.getByTestId("ai-chat-slot");
const chatButton = (page: Page) => page.getByTestId("ai-chat-button");
const header = (page: Page) => page.locator(".header-container");
const sidebarHeader = (page: Page) =>
  page.locator("[class*='AppsSidebar-module__header']");
const sidebarLogo = (page: Page) =>
  sidebarHeader(page).locator("[class*='logoFull']");
/** The collapse toggle, whichever of its two shapes the width calls for. */
const sidebarToggle = (page: Page) =>
  sidebarHeader(page).locator(
    "[class*='CollapseButton-module__wrapper'], [class*='collapsedHeader']",
  );

/**
 * The sidebar remembers its expanded/collapsed state per device class and
 * defaults to collapsed on tablet. Seed it open: a collapsed sidebar has no
 * logo in it, which is the half of this spec that needs one.
 */
const openRooms = async (
  page: Page,
  baseUrl: string,
  viewport: { width: number; height: number },
) => {
  await page.addInitScript(() => {
    localStorage.setItem("home_showSidebarText", "true");
  });
  await page.setViewportSize(viewport);
  await page.goto(`${baseUrl}${ROOMS_URL}`);

  await expect(chatButton(page)).toBeVisible();
  // Both the sidebar header and the chat slot settle a frame or two after the
  // layout does - the slot off a ResizeObserver, the sidebar off its stores.
  await page.waitForTimeout(600);
};

test.describe("Top row fit", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT),
      aiConfigHandler(TEST_PORT),
      roomListHandler(TEST_PORT, TypeRoomList.ContextMenu),
    );
  });

  for (const width of [DESKTOP.width, ...TABLET_WIDTHS]) {
    /**
     * The collapse button belongs at the far end of the sidebar header, with
     * only the header's own padding behind it - not wherever the logo happens
     * to stop. The gap is measured against the logo's width so the test says
     * something about the layout rather than about this particular wordmark:
     * whatever the logo is, the button must not follow it inwards.
     */
    test(`the sidebar collapse button sits at the trailing edge at ${width}px`, async ({
      page,
      baseUrl,
    }) => {
      await openRooms(page, baseUrl, { width, height: 900 });

      await expect(sidebarLogo(page)).toBeVisible();
      await expect(sidebarToggle(page)).toBeVisible();

      const headerBox = await sidebarHeader(page).boundingBox();
      const toggleBox = await sidebarToggle(page).boundingBox();
      const logoBox = await sidebarLogo(page).boundingBox();
      expect(headerBox).not.toBeNull();
      expect(toggleBox).not.toBeNull();
      expect(logoBox).not.toBeNull();

      // The header's padding-inline-end is 21px on desktop and 11px on tablet;
      // anything past that is the button drifting back towards the logo.
      const trailingGap =
        headerBox!.x + headerBox!.width - (toggleBox!.x + toggleBox!.width);
      expect(
        trailingGap,
        `the collapse button sits ${Math.round(trailingGap)}px from the header's trailing edge`,
      ).toBeLessThanOrEqual(21);
      expect(trailingGap).toBeGreaterThanOrEqual(0);

      // ...and it is genuinely past the logo rather than overlapping it.
      expect(toggleBox!.x).toBeGreaterThanOrEqual(logoBox!.x + logoBox!.width);
    });
  }

  for (const width of [DESKTOP.width, ...TABLET_WIDTHS, MOBILE.width]) {
    /**
     * The invariant the clipping broke: whatever state the button settles in,
     * all of it has to be painted. The slot hides its overflow, so a button
     * wider than its slot loses the difference off its leading edge - the icon
     * ends up flush against the pill's edge with the label half gone, which is
     * how the bug was reported.
     */
    test(`the AI chat button is never clipped by its slot at ${width}px`, async ({
      page,
      baseUrl,
    }) => {
      await openRooms(page, baseUrl, { width, height: 900 });

      const slotBox = await slot(page).boundingBox();
      const buttonBox = await chatButton(page).boundingBox();
      const headerBox = await header(page).boundingBox();
      expect(slotBox).not.toBeNull();
      expect(buttonBox).not.toBeNull();
      expect(headerBox).not.toBeNull();

      const collapsed = await slot(page).getAttribute("data-collapsed");

      expect(
        buttonBox!.x,
        `the button starts ${Math.round(slotBox!.x - buttonBox!.x)}px before its slot (collapsed=${collapsed})`,
      ).toBeGreaterThanOrEqual(slotBox!.x - 1);
      expect(
        buttonBox!.x + buttonBox!.width,
        `the button ends ${Math.round(buttonBox!.x + buttonBox!.width - slotBox!.x - slotBox!.width)}px past its slot (collapsed=${collapsed})`,
      ).toBeLessThanOrEqual(slotBox!.x + slotBox!.width + 1);

      // The same again one level up: the header must not have to clip it.
      expect(buttonBox!.x + buttonBox!.width).toBeLessThanOrEqual(
        headerBox!.x + headerBox!.width + 1,
      );
      expect(buttonBox!.x).toBeGreaterThanOrEqual(headerBox!.x - 1);
    });
  }

  /**
   * The slot asking for more than it is given is the condition that used to
   * clip. It is allowed to happen - the row decides how much it can spare -
   * but the button has to answer it by collapsing, which is the one state
   * narrow enough to always fit.
   */
  test("a squeezed slot collapses the button instead of clipping it", async ({
    page,
    baseUrl,
  }) => {
    for (const width of TABLET_WIDTHS) {
      await openRooms(page, baseUrl, { width, height: 900 });

      const squeezed = await slot(page).evaluate((el) => {
        const node = el as HTMLElement;
        // What the slot asked the row for, vs. what the row granted.
        return parseFloat(node.style.width || "0") > node.clientWidth + 1;
      });

      if (!squeezed) continue;

      expect(
        await slot(page).getAttribute("data-collapsed"),
        `at ${width}px the slot is narrower than it asked for but the label is still rendered`,
      ).toBe("true");
      await expect(
        chatButton(page).getByText("AI Chat", { exact: true }),
      ).toBeHidden();
      // Collapsed still means reachable and still named.
      await expect(chatButton(page)).toHaveAttribute("aria-label", "AI Chat");
      await expect(chatButton(page).locator("svg")).toBeVisible();
    }
  });
});

/**
 * The frames themselves. One per device class, so a review of this row can be
 * done by looking rather than by reading numbers back - which is how both
 * defects were spotted in the first place, and how the next one will be.
 *
 * They also cover ground the assertions above cannot reach: mobile has no
 * sidebar header to measure but does put the wordmark in the middle of its nav
 * bar, and "the collapse button is at the trailing edge" says nothing about
 * whether the logo next to it is the right size or vertically centred.
 */
test.describe("Top row fit - frames", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT),
      aiConfigHandler(TEST_PORT),
      roomListHandler(TEST_PORT, TypeRoomList.ContextMenu),
    );
  });

  for (const frame of FRAMES) {
    test(`the top row at ${frame.key}`, async ({ page, baseUrl }) => {
      await openRooms(page, baseUrl, frame.viewport);

      await expectScreenshot(page, ["desktop", "top-row-fit", `${frame.key}.png`], {
        clip: {
          x: 0,
          y: 0,
          width: frame.viewport.width,
          height: frame.clipHeight,
        },
      });
    });
  }
});

/**
 * The tariff line, which the same grid starved a second way.
 *
 * It lives in `.controlButtonContainer` alongside the chat and option buttons,
 * so it inherited that column's 90px ceiling: on a 1023px header it rendered
 * 40px wide - "Try the Bus..." - with three quarters of the row empty next to
 * a seven-character page title. Inside a room it was fine all along, because
 * that layout is the one rule in Navigation.module.scss that already put the
 * flexible track on the controls instead of the title.
 *
 * Both halves matter and are asserted together: an uncut tariff line proves
 * nothing on its own (it is allowed to disappear when the row is genuinely
 * full), so each test first establishes that the title is not truncating -
 * that is what makes "the header had room" a fact rather than an assumption.
 */
const ROOM_ID = 4242;

/**
 * `CopySharedLink` is what puts the "Share room" button in the header, and
 * that in turn switches the grid to `[data-show-navigation-button="true"]` -
 * the rule that was already correct. Turning it off is how the second broken
 * rule (`49px 1fr auto`, every non-root folder) becomes reachable.
 */
const roomFolderHandler = (port: string, title: string, canShare: boolean) =>
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/files/:id(\\d+)`, () => {
    const current = {
      parentId: 14,
      filesCount: 0,
      foldersCount: 0,
      new: 0,
      mute: false,
      tags: [],
      logo: { original: "", large: "", medium: "", small: "", color: "4781D1" },
      pinned: false,
      roomType: 6, // RoomsType.PublicRoom
      isRoom: true,
      private: false,
      indexing: false,
      denyDownload: false,
      inRoom: true,
      usedSpace: 0,
      fileEntryType: 1,
      id: ROOM_ID,
      rootFolderId: 14,
      canShare: true,
      security: {
        Read: true,
        Create: true,
        Delete: true,
        EditRoom: true,
        Rename: true,
        CopySharedLink: canShare,
      },
      title,
      access: 0,
      shared: true,
      created: "2026-01-15T12:00:00.000Z",
      updated: "2026-01-15T12:00:00.000Z",
      rootFolderType: 14, // FolderType.Rooms
      parentRoomType: 14,
    };

    return new Response(
      JSON.stringify({
        response: {
          files: [],
          folders: [],
          current,
          pathParts: [
            { id: 14, title: "Rooms" },
            { id: ROOM_ID, title },
          ],
          startIndex: 0,
          count: 0,
          total: 0,
          new: 0,
        },
      }),
    );
  });

/** The width the truncation was reported at - the top of the tablet band. */
const TARIFF_WIDTH = 1023;

const tariffText = (page: Page) => page.locator("#tariff-bar-text");
const roomName = (page: Page) => page.locator(".title-block-text");

const isTruncated = (locator: ReturnType<typeof tariffText>) =>
  locator.evaluate((el) => {
    const node = el as HTMLElement;
    return node.scrollWidth > node.clientWidth + 1;
  });

/**
 * Land wide, then narrow. `checkBar()` runs on mount only (a known gap, see
 * room-header-crowding.spec.ts), so arriving at the width directly can have
 * the line hide itself and there would be nothing left to measure. Resizing
 * into it is also how the report was produced.
 */
const narrowInto = async (page: Page, baseUrl: string, url: string) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${baseUrl}${url}`);
  await expect(chatButton(page)).toBeVisible();
  await page.waitForTimeout(600);

  await page.setViewportSize({ width: TARIFF_WIDTH, height: 900 });
  await page.waitForTimeout(600);
};

test.describe("Top row fit - tariff line", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      // SaaS on the free plan, so the tariff line renders its longest wording.
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfHandlerWithCulture(TEST_PORT, "ru-RU"),
      aiConfigHandler(TEST_PORT),
      tariffHandler(TEST_PORT),
      freeQuotaHandler(TEST_PORT),
      roomListHandler(TEST_PORT, TypeRoomList.ContextMenu),
      roomFolderHandler(TEST_PORT, "Public", false),
    );
  });

  const CASES = [
    {
      key: "on the rooms root",
      url: ROOMS_URL,
      // `[data-is-root-folder="true"][data-with-logo="false"]`, the rule the
      // report came from.
    },
    {
      key: "in a folder with no share button",
      url: `/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`,
      // The generic `49px 1fr auto` rule - same defect, different rule, and it
      // cut the line down to 7px rather than 40.
    },
  ];

  for (const testCase of CASES) {
    test(`is not cut while the header has room ${testCase.key}`, async ({
      page,
      baseUrl,
    }) => {
      await narrowInto(page, baseUrl, testCase.url);

      if ((await tariffText(page).count()) === 0) return;
      if (!(await tariffText(page).isVisible())) return;

      // The header is not crowded: the title is showing in full. Without this
      // the assertion below would also pass on a header that has legitimately
      // run out of space and truncated everything.
      expect(
        await isTruncated(roomName(page)),
        "the title is truncating, so the header is genuinely full and this case proves nothing",
      ).toBe(false);

      expect(
        await isTruncated(tariffText(page)),
        `the tariff line is cut to ${Math.round(
          (await tariffText(page).boundingBox())?.width ?? 0,
        )}px of the ${await tariffText(page).evaluate(
          (el) => (el as HTMLElement).scrollWidth,
        )}px it needs`,
      ).toBe(false);
    });
  }
});
