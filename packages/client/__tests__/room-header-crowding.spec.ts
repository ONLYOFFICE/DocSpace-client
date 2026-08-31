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


import { http } from "msw";
import type { Page } from "@playwright/test";

import { BASE_URL, API_PREFIX } from "@docspace/shared/__mocks__/e2e/utils";
import {
  expectScreenshot,
  type WorkerFixture,
} from "@docspace/shared/__mocks__/e2e";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfHandlerWithCulture,
  aiConfigHandler,
  roomListHandler,
  TypeRoomList,
  tariffHandler,
  freeQuotaHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * How the section header of a room behaves when everything in it competes for
 * the same width.
 *
 * Inside a shared room the header carries, from the leading edge: the back
 * arrow, the room's name (written by whoever created it, so of no bounded
 * length), the plus and context buttons, the "Share room" button, the tariff
 * line, the "AI chat" button and the info-panel toggle. Open the info panel and
 * ~400px of that row is gone. Every label but the room name is localised, and
 * Russian, German and French all word these three controls longer than English
 * does.
 *
 * This spec exists to make that crowding visible rather than to prescribe a
 * fix. It has two halves:
 *
 *  - `frames` takes one clipped screenshot of the header per language, width
 *    and room-name length. These are the frames to hand to design.
 *  - `invariants` states, as assertions, the five things the header should do
 *    when it runs out of room. One of them does not hold today and carries
 *    `test.fail()` with the reason - when a fix lands, Playwright reports
 *    "expected to fail but passed" and the marker comes off.
 *
 * Screenshots only compare truthfully in Docker (see `.claude/rules/
 * e2e-tests.md`); the invariants are geometric and hold on a local run too.
 */

/** Any id works - the folder handler below answers for whatever is asked. */
const ROOM_ID = 4242;
const ROOM_URL = `/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`;

/** The name from the report: short enough that English fits comfortably. */
const SHORT_NAME = "Public";
/**
 * A name of the length rooms actually get named in the field. Nothing stops a
 * user from typing this, so the header has to survive it.
 */
const LONG_NAME = "Sales and marketing - contracts and NDAs 2026";

const DESKTOP = { width: 1440, height: 900 };
/** The width the crowding was reported at. */
const NARROW = { width: 1280, height: 900 };

const header = (page: Page) => page.locator(".header-container");
const roomName = (page: Page) => page.locator(".title-block-text");
const shareButton = (page: Page) => page.getByTestId("navigation_button");
const tariffText = (page: Page) => page.locator("#tariff-bar-text");
const chatSlot = (page: Page) => page.getByTestId("ai-chat-slot");
const chatButton = (page: Page) => page.getByTestId("ai-chat-button");
const infoPanelToggle = (page: Page) => page.locator("#info-panel-toggle--open");

/**
 * The room the header is rendered for. `shared` plus `security.CopySharedLink`
 * under a Rooms root is what puts the "Share room" button in the header
 * (packages/client/src/pages/Home/Section/Header/index.js), and `pathParts` of
 * length two is what makes this an inside-a-room header rather than the root
 * one.
 */
const roomFolderHandler = (port: string, title: string) =>
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/files/:id(\\d+)`, () => {
    const current = {
      parentId: 14,
      filesCount: 0,
      foldersCount: 0,
      new: 0,
      mute: false,
      tags: [],
      logo: {
        original: "",
        large: "",
        medium: "",
        small: "",
        color: "4781D1",
      },
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
        CopySharedLink: true,
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

type Case = {
  /** File-name part and the culture the portal is switched to. */
  key: string;
  culture: string;
  name: string;
  viewport: { width: number; height: number };
  /** The info panel eats ~400px of the header row when open. */
  withInfoPanel: boolean;
};

/**
 * English at full width with the panel closed is the control frame - the
 * header as it was designed. Everything else is a language and a width the
 * header is also expected to survive.
 */
const CASES: Case[] = [
  {
    key: "en-short-1440",
    culture: "en-US",
    name: SHORT_NAME,
    viewport: DESKTOP,
    withInfoPanel: false,
  },
  {
    key: "en-short-1280-info-panel",
    culture: "en-US",
    name: SHORT_NAME,
    viewport: NARROW,
    withInfoPanel: true,
  },
  {
    key: "ru-short-1280-info-panel",
    culture: "ru-RU",
    name: SHORT_NAME,
    viewport: NARROW,
    withInfoPanel: true,
  },
  {
    key: "de-short-1280-info-panel",
    culture: "de-DE",
    name: SHORT_NAME,
    viewport: NARROW,
    withInfoPanel: true,
  },
  {
    key: "fr-short-1280-info-panel",
    culture: "fr-FR",
    name: SHORT_NAME,
    viewport: NARROW,
    withInfoPanel: true,
  },
  {
    key: "en-long-1440",
    culture: "en-US",
    name: LONG_NAME,
    viewport: DESKTOP,
    withInfoPanel: false,
  },
  {
    key: "ru-long-1440-info-panel",
    culture: "ru-RU",
    name: LONG_NAME,
    viewport: DESKTOP,
    withInfoPanel: true,
  },
  {
    key: "ru-long-1280-info-panel",
    culture: "ru-RU",
    name: LONG_NAME,
    viewport: NARROW,
    withInfoPanel: true,
  },
  {
    key: "de-long-1280-info-panel",
    culture: "de-DE",
    name: LONG_NAME,
    viewport: NARROW,
    withInfoPanel: true,
  },
];

/**
 * A portal on the free SaaS plan, so the tariff line renders its longest
 * wording ("Try the Business plan") - the case the report was filed from.
 * `asc_language` is what the client reads the language off on the first paint;
 * the culture on /people/@self keeps it there after the stores load.
 */
const openRoom = async (
  page: Page,
  baseUrl: string,
  mockRequest: WorkerFixture,
  testCase: Case,
) => {
  mockRequest.use(
    // SaaS, not the default standalone preset: a standalone portal words
    // the tariff line off its licence date instead, and the wording under
    // report is the SaaS one.
    settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
    selfActivationStatusHandler(TEST_PORT, null, false, true),
    selfHandlerWithCulture(TEST_PORT, testCase.culture),
    aiConfigHandler(TEST_PORT),
    tariffHandler(TEST_PORT),
    freeQuotaHandler(TEST_PORT),
    roomListHandler(TEST_PORT, TypeRoomList.ContextMenu),
    roomFolderHandler(TEST_PORT, testCase.name),
  );

  await page.setViewportSize(testCase.viewport);
  await page.context().addCookies([
    {
      name: "asc_language",
      value: testCase.culture,
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.goto(`${baseUrl}${ROOM_URL}`);
  await expect(roomName(page)).toBeVisible();
  await expect(chatButton(page)).toBeVisible();

  if (testCase.withInfoPanel) {
    await infoPanelToggle(page).click();
  }

  // The AI chat slot collapses off a ResizeObserver, and the tariff line
  // measures itself in an effect - both settle a frame or two after the layout
  // does.
  await page.waitForTimeout(500);
};

/** Reads back whether an element is painted outside its own clipping box. */
const overflowsBox = async (
  outer: ReturnType<typeof shareButton>,
  inner: ReturnType<typeof shareButton>,
) => {
  const outerBox = await outer.boundingBox();
  const innerBox = await inner.boundingBox();
  if (!outerBox || !innerBox) return false;

  return (
    innerBox.x < outerBox.x - 1 ||
    innerBox.x + innerBox.width > outerBox.x + outerBox.width + 1
  );
};

test.describe("Room header crowding - frames", () => {
  for (const testCase of CASES) {
    test(`header at ${testCase.key}`, async ({ page, baseUrl, mockRequest }) => {
      await openRoom(page, baseUrl, mockRequest, testCase);

      // Clipped to the header row: the file list and banners below it carry
      // churn that has nothing to do with what these frames are about.
      const box = await header(page).boundingBox();
      expect(box).not.toBeNull();
      await expectScreenshot(
        page,
        ["desktop", "room-header-crowding", `${testCase.key}.png`],
        { clip: box! },
      );
    });
  }
});

test.describe("Room header crowding - invariants", () => {
  /**
   * The one that already holds: nothing in the header is allowed to paint
   * outside the header itself. Cut labels are cut *inside* their control, so
   * this passes today and is here to catch the opposite failure - a fix that
   * lets the row spill instead of shrinking.
   */
  test("nothing spills out of the header row", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    await openRoom(page, baseUrl, mockRequest, {
      key: "ru-long-1280-info-panel",
      culture: "ru-RU",
      name: LONG_NAME,
      viewport: NARROW,
      withInfoPanel: true,
    });

    const headerBox = await header(page).boundingBox();
    expect(headerBox).not.toBeNull();

    for (const part of [roomName(page), shareButton(page), chatSlot(page)]) {
      if ((await part.count()) === 0) continue;
      const box = await part.boundingBox();
      if (!box) continue;
      expect(box.x).toBeGreaterThanOrEqual(headerBox!.x - 1);
      expect(box.x + box.width).toBeLessThanOrEqual(
        headerBox!.x + headerBox!.width + 1,
      );
    }
  });

  /**
   * A shortened label ends in an ellipsis rather than being sliced mid-word.
   * ui-kit's Button on its own does slice - `overflow: hidden` sits on the
   * <button> while the label span has no `min-width: 0`, so the label loses
   * characters at both ends and gets no ellipsis (that is what the app cards on
   * the dashboard look like). The section header escapes it: SectionHeader.
   * module.scss puts `overflow: visible` on `.navigation_button` and truncates
   * `.button-content` instead. This holds today and is the guard on that
   * override - drop it and the header inherits the slicing.
   */
  test("a shortened share label ends in an ellipsis", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    await openRoom(page, baseUrl, mockRequest, {
      key: "ru-short-1280-info-panel",
      culture: "ru-RU",
      name: SHORT_NAME,
      viewport: NARROW,
      withInfoPanel: true,
    });

    await expect(shareButton(page)).toBeVisible();

    // Whichever element clips the label has to be the one carrying the
    // ellipsis, and the label has to start at that element's leading edge -
    // a centred overflow is what loses the first characters.
    const clipping = await shareButton(page).evaluate((el) => {
      const nodes = [el, ...Array.from(el.querySelectorAll("*"))];
      const clipper = nodes.find((node) => {
        const style = getComputedStyle(node as Element);
        return (
          (style.overflowX === "hidden" || style.overflowX === "clip") &&
          (node as HTMLElement).scrollWidth > (node as HTMLElement).clientWidth
        );
      }) as HTMLElement | undefined;

      if (!clipper) return { truncated: false, ellipsis: "", aligned: true };

      const clipperBox = clipper.getBoundingClientRect();
      const textBox = (
        clipper.firstElementChild ?? clipper
      ).getBoundingClientRect();

      return {
        truncated: true,
        ellipsis: getComputedStyle(clipper).textOverflow,
        aligned: textBox.left >= clipperBox.left - 1,
      };
    });

    if (!clipping.truncated) return; // the label fits; nothing to check

    expect(clipping.ellipsis, "the clipped label has no ellipsis").toBe(
      "ellipsis",
    );
    expect(
      clipping.aligned,
      "the label is centred inside its clip, so it loses its first characters",
    ).toBe(true);
  });

  /**
   * The tariff line is built to disappear whole rather than truncate - that is
   * what the `hidden` class in tariff-bar.module.scss is for. It does not,
   * because `checkBar()` runs on mount and on a title change only
   * (packages/client/src/components/TariffBar/helpers.js), so opening the info
   * panel or resizing the window leaves a measured-once line in a row that has
   * since become narrower.
   */
  test("the tariff line disappears instead of truncating", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    test.fail(
      true,
      "known: checkBar() never re-runs, so the line truncates instead of hiding",
    );

    await openRoom(page, baseUrl, mockRequest, {
      key: "ru-short-1280-info-panel",
      culture: "ru-RU",
      name: SHORT_NAME,
      viewport: NARROW,
      withInfoPanel: true,
    });

    if ((await tariffText(page).count()) === 0) return;

    const truncated = await tariffText(page).evaluate((el) => {
      const node = el as HTMLElement;
      return node.scrollWidth > node.clientWidth + 1;
    });

    expect(
      truncated && (await tariffText(page).isVisible()),
      "a truncated tariff line is still on screen",
    ).toBe(false);
  });

  /**
   * The agreed order in which the header gives up space: the tariff line goes
   * first, the AI chat button drops to its bare icon second, and only then may
   * anything else start losing text. What sequences the last two is which side
   * of the header row carries the larger flex-shrink
   * (libs/ui-kit/components/navigation/Navigation.module.scss): the button row
   * does, so the first ~64px of any deficit is spent on the chat label and the
   * title is only squeezed after that. This used to be inverted, and the chat
   * button kept its label while its neighbours were cut.
   */
  test("the chat button gives up its label before its neighbours are cut", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    await openRoom(page, baseUrl, mockRequest, {
      key: "ru-short-1280-info-panel",
      culture: "ru-RU",
      name: SHORT_NAME,
      viewport: NARROW,
      withInfoPanel: true,
    });

    const labelSpan = shareButton(page).locator("span").first();
    const shareIsCut = await overflowsBox(shareButton(page), labelSpan);
    const chatIsCollapsed =
      (await chatSlot(page).getAttribute("data-collapsed")) === "true";

    // Only meaningful while the share button is under pressure; if it fits,
    // there is nothing for the chat button to have yielded for.
    expect(
      !shareIsCut || chatIsCollapsed,
      "the share button is cut while the chat button still shows its label",
    ).toBe(true);
  });

  /**
   * The room's own name is the last thing that should lose space, and it keeps
   * a floor of ~200px (roughly 25-30 characters) before it starts truncating -
   * the rest goes to the tooltip. It holds because the AI chat button now hands
   * its label's width back before the title is squeezed this far; it used to
   * come out at 167px.
   */
  test("the room name keeps a readable minimum", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    await openRoom(page, baseUrl, mockRequest, {
      key: "ru-long-1280-info-panel",
      culture: "ru-RU",
      name: LONG_NAME,
      viewport: NARROW,
      withInfoPanel: true,
    });

    const box = await roomName(page).boundingBox();
    expect(box).not.toBeNull();
    expect(
      box!.width,
      `the room name is ${Math.round(box!.width)}px wide`,
    ).toBeGreaterThanOrEqual(200);
  });
});
