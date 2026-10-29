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
import { expect, test, TEST_PORT } from "./fixtures/base";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  roomListHandler,
  TypeRoomList,
  filesSettingsHandler,
  roomGroupsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { ShareAccessRights } from "@docspace/shared/enums";

type TabStop = {
  name: string;
  testId: string | null;
  visible: boolean;
  hidden: boolean;
  ring: boolean;
  // Sides of the element's own outline that an ancestor's overflow cuts off.
  clipped: string[];
};

// Describes the focused element: what it is, whether a sighted keyboard user
// can see it, and whether it draws a focus indicator of its own.
const describeFocus = (page: Page) =>
  page.evaluate((): TabStop | null => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;

    const rect = el.getBoundingClientRect();
    let visible = rect.width > 0 && rect.height > 0;
    for (let node: Element | null = el; node && visible; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        Number(style.opacity) === 0
      )
        visible = false;
    }

    const hasRing = (node: Element) => {
      const style = getComputedStyle(node);
      return (
        (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) ||
        style.boxShadow !== "none"
      );
    };

    // The outline reaches `offset + width` past the border box; every
    // ancestor that clips its overflow must leave that much room.
    const style = getComputedStyle(el);
    const reach =
      style.outlineStyle === "none"
        ? 0
        : Math.max(
            0,
            parseFloat(style.outlineOffset) + parseFloat(style.outlineWidth),
          );
    const clipped = new Set<string>();
    for (let node = el.parentElement; node && reach > 0; node = node.parentElement) {
      const s = getComputedStyle(node);
      if (s.overflowX === "visible" && s.overflowY === "visible") continue;
      const box = node.getBoundingClientRect();
      if (rect.top - reach < box.top - 0.5) clipped.add("top");
      if (rect.bottom + reach > box.bottom + 0.5) clipped.add("bottom");
      if (rect.left - reach < box.left - 0.5) clipped.add("left");
      if (rect.right + reach > box.right + 0.5) clipped.add("right");
    }

    const label =
      el.getAttribute("aria-label") ||
      (el instanceof HTMLElement ? el.innerText : el.textContent) ||
      el.getAttribute("placeholder") ||
      "";

    return {
      name: `${el.tagName.toLowerCase()} "${label.trim().slice(0, 40)}"`,
      testId:
        el.getAttribute("data-testid") ||
        el.closest("[data-testid]")?.getAttribute("data-testid") ||
        null,
      visible,
      hidden: !!el.closest('[inert], [aria-hidden="true"]'),
      // Checkbox and radio draw the ring on a sibling or child shape.
      ring:
        hasRing(el) ||
        [...el.querySelectorAll("*")].some(hasRing) ||
        (!!el.nextElementSibling && hasRing(el.nextElementSibling)),
      clipped: [...clipped],
    };
  });

// Presses `key` until focus comes back to where it started (the page wraps
// through the browser chrome as body), collecting every stop on the way.
const walk = async (page: Page, key: "Tab" | "Shift+Tab", limit = 120) => {
  const stops: TabStop[] = [];
  for (let i = 0; i < limit; i += 1) {
    await page.keyboard.press(key);
    let stop = await describeFocus(page);
    if (!stop) break;
    // Some controls fade in on :focus-within; judge them once that is done.
    if (!stop.visible) {
      await page.waitForTimeout(500);
      stop = (await describeFocus(page)) ?? stop;
    }
    stops.push(stop);
  }
  return stops;
};

const openRooms = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}/rooms/shared/`);
  await expect(page.getByTestId("table-body")).toBeVisible();
  // Once loaded, the portal hands the focus to the section body so the list's
  // hotkeys apply. Wait for that, then start every walk from the top of the
  // document: blur() would leave the browser's starting point in the section.
  await expect(page.locator(".section-body").first()).toBeFocused();
  // It may do so more than once while the page settles.
  await page.waitForLoadState("networkidle");
  await page.mouse.click(1, 1);
};

// Every stop is visible, outside hidden content, and draws a ring nothing
// clips.
const expectUsableStops = (stops: TabStop[]) => {
  expect(
    stops.filter((s) => !s.visible || s.hidden).map((s) => s.name),
    "focus landed on hidden elements",
  ).toEqual([]);
  expect(
    stops.filter((s) => !s.ring).map((s) => `${s.name} [${s.testId}]`),
    "focused elements without a visible focus indicator",
  ).toEqual([]);
  expect(
    stops
      .filter((s) => s.clipped.length)
      .map((s) => `${s.name} [${s.testId}] cut: ${s.clipped.join(",")}`),
    "focus rings cut off by an ancestor's overflow",
  ).toEqual([]);
};

// Tabs forward until `predicate` holds for the focused element.
const tabTo = async (
  page: Page,
  predicate: (stop: TabStop) => boolean,
  limit = 80,
) => {
  for (let i = 0; i < limit; i += 1) {
    await page.keyboard.press("Tab");
    const stop = await describeFocus(page);
    if (stop && predicate(stop)) return stop;
  }
  throw new Error("Tab never reached the expected element");
};

test.describe("Keyboard navigation: rooms", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
        access: ShareAccessRights.RoomManager,
      }),
    );
  });

  test("every Tab stop is visible, reachable and shows focus", async ({
    page,
    baseUrl,
  }) => {
    await openRooms(page, baseUrl);

    const stops = await walk(page, "Tab");

    expect(stops.length).toBeGreaterThan(10);
    expectUsableStops(stops);
  });

  test("the controls a mouse uses are all reachable by Tab", async ({
    page,
    baseUrl,
  }) => {
    await openRooms(page, baseUrl);

    const stops = await walk(page, "Tab");
    const testIds = new Set(stops.map((s) => s.testId));
    const names = stops.map((s) => s.name);

    // Search, filter, sort, column headers, table settings, the sidebar and
    // panel toggles and the row menus used to be pointer-only.
    for (const testId of [
      "text-input",
      "filter_icon_button",
      "filter_sort_combobox",
      "column-Name",
      "table-settings-button",
      "dev-tools-bar",
      "profile_user_icon_button",
    ]) {
      expect(testIds, `${testId} is not a Tab stop`).toContain(testId);
    }
    for (const name of [
      'div "Hide menu"',
      'div "Info panel"',
      'div "Show Folder Actions"',
    ]) {
      expect(names, `${name} is not a Tab stop`).toContain(name);
    }

    // The section's drop zone wraps everything and opens nothing; it stays
    // focusable from script for the list's hotkeys.
    const dropZone = page.locator(".drag-and-drop").first();
    await expect(dropZone).toHaveAttribute("tabindex", "-1");
    await expect(dropZone).toHaveAttribute("role", "presentation");
  });

  test("Shift+Tab visits the same stops in reverse", async ({
    page,
    baseUrl,
  }) => {
    await openRooms(page, baseUrl);
    const forward = (await walk(page, "Tab")).map((s) => s.name);

    // Go back to the last stop and walk back to the first, inside the page:
    // where focus goes past either end of the document is the browser's.
    await openRooms(page, baseUrl);
    for (const _ of forward) await page.keyboard.press("Tab");
    const backward = [(await describeFocus(page))?.name];
    for (let i = 1; i < forward.length; i += 1) {
      await page.keyboard.press("Shift+Tab");
      backward.push((await describeFocus(page))?.name);
    }

    expect(backward).toEqual([...forward].reverse());
  });

  test("collapsed sidebar sections keep their links out of the Tab order", async ({
    page,
    baseUrl,
  }) => {
    await openRooms(page, baseUrl);

    const files = await tabTo(page, (s) => s.name.startsWith('button "Files'));
    expect(files.visible).toBe(true);

    // Rooms is the open section; Files is collapsed, so Tab skips its links.
    await page.keyboard.press("Tab");
    const next = await describeFocus(page);
    expect(next?.name).toMatch(/^button "Rooms/);

    // Shift+Tab goes back to Files. The Shift keydown used to make the file
    // hotkeys pull the focus into the list, so the Tab ran back from there.
    await page.keyboard.press("Shift+Tab");
    expect((await describeFocus(page))?.name).toMatch(/^button "Files/);

    // Enter opens Files from the keyboard, and the focus is not dropped on
    // <body> on the way.
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", { name: "Files", exact: true }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(await describeFocus(page)).not.toBeNull();
  });

  test("search can be reached and typed into without a mouse", async ({
    page,
    baseUrl,
  }) => {
    await openRooms(page, baseUrl);

    await tabTo(page, (s) => s.testId === "text-input");
    const search = page.getByTestId("filter_search_input").locator("input");
    await expect(search).toBeFocused();

    await page.keyboard.type("report");
    await expect(search).toHaveValue("report");
  });

  test("filter panel opens with Enter and closes with Escape", async ({
    page,
    baseUrl,
  }) => {
    await openRooms(page, baseUrl);

    await tabTo(page, (s) => s.testId === "filter_icon_button");
    const button = page.getByTestId("filter_icon_button");
    await expect(button).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByTestId("filter_apply_button")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("filter_apply_button")).toBeHidden();
    await expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("a room's menu opens from the keyboard and Escape returns focus", async ({
    page,
    baseUrl,
  }) => {
    await openRooms(page, baseUrl);

    await tabTo(page, (s) => s.name === 'div "Show Folder Actions"');
    // Pin the opener: a ":focus" locator would follow the focus around.
    await page.evaluate(() =>
      document.activeElement?.setAttribute("data-keyboard-opener", ""),
    );
    const opener = page.locator("[data-keyboard-opener]");

    await page.keyboard.press("Enter");
    const item = page.getByTestId("more-options");
    await expect(item).toBeVisible();

    // The menu sits next to its button, not at the corner of the page.
    const [openerBox, itemBox] = await Promise.all([
      opener.boundingBox(),
      item.boundingBox(),
    ]);
    expect(Math.abs((itemBox?.y ?? 0) - (openerBox?.y ?? 0))).toBeLessThan(400);

    await page.keyboard.press("Escape");
    await expect(item).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("a column is sorted from the keyboard", async ({ page, baseUrl }) => {
    await openRooms(page, baseUrl);

    const header = await tabTo(page, (s) => s.name.startsWith('div "Name'));
    expect(header.ring).toBe(true);

    const request = page.waitForRequest((r) =>
      /sortby=title|sortBy=AZ|sortby=AZ/i.test(r.url()),
    );
    await page.keyboard.press("Enter");
    await request;
  });

  for (const key of ["Enter", "Space"]) {
    test(`the sort list opens with ${key} and sorts from the keyboard`, async ({
      page,
      baseUrl,
    }) => {
      await openRooms(page, baseUrl);

      await tabTo(page, (s) => s.testId === "filter_sort_combobox");
      await page.keyboard.press(key);

      const options = page.locator('[data-testid^="filter_sort_option_"]');
      await expect(options.first()).toBeVisible();

      const request = page.waitForRequest((r) => /sortby=/i.test(r.url()));
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await request;
    });
  }

  test("the view switches from the keyboard", async ({ page, baseUrl }) => {
    await openRooms(page, baseUrl);

    const icon = await tabTo(page, (s) => s.testId === "view-selector-icon");
    expect(icon.ring).toBe(true);

    await page.keyboard.press("Enter");
    await expect(page.getByTestId("table-body")).toBeHidden();
  });

  test("the sidebar collapse button works from the keyboard", async ({
    page,
    baseUrl,
  }) => {
    await openRooms(page, baseUrl);

    const toggle = await tabTo(page, (s) => s.name === 'div "Hide menu"', 15);
    expect(toggle.ring).toBe(true);

    const home = page.getByRole("link", { name: "Home" }).first();
    const before = (await home.boundingBox())?.width ?? 0;

    await page.keyboard.press("Enter");

    // The rail keeps the icons only, so the link narrows.
    await expect
      .poll(async () => (await home.boundingBox())?.width ?? 0)
      .toBeLessThan(before);
  });
});

test.describe("Keyboard navigation: room groups", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
      roomGroupsHandler(TEST_PORT, true),
    );
  });

  test("group tabs are Tab stops that show focus and switch the group", async ({
    page,
    baseUrl,
  }) => {
    await openRooms(page, baseUrl);
    const allRooms = page.getByTestId("all_rooms_tags_measure");
    await expect(allRooms).toBeVisible();

    const stops = await walk(page, "Tab");
    expectUsableStops(stops);

    // Every group tab on screen is a stop.
    const testIds = stops.map((s) => s.testId);
    const tabs = page.locator(
      '.group-tags [data-testid="all_rooms_tags_measure"], .group-tags [data-testid="create_group_tag"], .group-tags [data-testid^="room_group_tag_"]',
    );
    const visibleTabs = await tabs.evaluateAll((nodes) =>
      nodes
        .filter((node) => node.getBoundingClientRect().width > 0)
        .map((node) => node.getAttribute("data-testid")),
    );
    expect(visibleTabs.length).toBeGreaterThan(1);
    for (const tab of visibleTabs) expect(testIds).toContain(tab);
    // The hidden copies used to measure the tabs stay out of the order.
    expect(
      stops.filter((s) => s.name.includes("All rooms")),
      "the measuring copy of All rooms is a stop",
    ).toHaveLength(1);

    await page.mouse.click(1, 1);
    const { testId } = await tabTo(page, (s) =>
      (s.testId ?? "").startsWith("room_group_tag_"),
    );
    const group = page.getByTestId(testId ?? "");
    await expect(group).toHaveAttribute("aria-pressed", "false");

    await page.keyboard.press("Enter");
    await expect(group).toHaveAttribute("aria-pressed", "true");
    await expect(allRooms).toHaveAttribute("aria-pressed", "false");
  });
});
