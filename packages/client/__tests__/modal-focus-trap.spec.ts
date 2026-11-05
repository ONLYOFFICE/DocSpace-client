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
import type { Locator, Page } from "@playwright/test";
import { BASE_URL } from "@docspace/shared/__mocks__/e2e";
import { myDocumentsResolver } from "@docspace/shared/__mocks__/handlers/files/documents";
import { roomTagsHandler } from "@docspace/shared/__mocks__/handlers/rooms/tags";
import { expect, test, TEST_PORT } from "./fixtures/base";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  roomListHandler,
  TypeRoomList,
  rootHandler,
  filesSettingsHandler,
  myHandler,
  myDocumentsHandler,
  roomGroupsHandler,
  roomGroupByIdHandler,
} from "@docspace/shared/__mocks__/handlers";

const FOLDER_ID = 12764;
const PERSONAL_FOLDER_URL = `/rooms/personal/filter?folder=${FOLDER_ID}`;
// Row of the JPG in the personal folder's list (0-based, the folder first).
const JPG_ROW = 2;
const FOLDER_ENDPOINT = `${BASE_URL}:${TEST_PORT}/api/2.0/files/:id`;

// What the focus is on, in words a failure message can show.
const describeFocus = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return "<body>";
    const label =
      el.getAttribute("aria-label") ||
      el.getAttribute("data-testid") ||
      (el instanceof HTMLElement ? el.innerText : "") ||
      "";
    return `${el.tagName.toLowerCase()} "${label.trim().slice(0, 30)}"`;
  });

const focusIsIn = (container: Locator) =>
  container.evaluate((el) => el.contains(document.activeElement));

// Numbers every element of the container that Tab should stop on - the same
// rule the trap uses - so a walk can tell which of them it never reached.
const markStops = (container: Locator) =>
  container.evaluate((root) => {
    const candidates = root.querySelectorAll<HTMLElement>(
      "a[href], area[href], button, input:not([type='hidden']), select, textarea, iframe, summary, [contenteditable]:not([contenteditable='false']), [tabindex]",
    );
    const stops = [...candidates].filter(
      (el) =>
        el.tabIndex >= 0 &&
        !("disabled" in el && el.disabled === true) &&
        !el.closest("[inert]") &&
        el.getClientRects().length > 0 &&
        getComputedStyle(el).visibility !== "hidden" &&
        !(el instanceof HTMLInputElement && el.type === "radio" && !el.checked),
    );
    stops.forEach((el, index) =>
      el.setAttribute("data-trap-stop", String(index)),
    );
    return stops.map(
      (el) =>
        `${el.tagName.toLowerCase()} "${(el.getAttribute("aria-label") || el.getAttribute("data-testid") || el.textContent || "").trim().slice(0, 30)}"`,
    );
  });

// Presses Tab, then Shift+Tab, more times than the container has stops: after
// every press the focus must still be inside it, each direction must come back
// round, and every stop must have been reached on the way - a walk that loops
// over a few of them (say, the search box and the list) leaves the rest out.
const expectFocusTrapped = async (
  page: Page,
  container: Locator,
  presses = 25,
) => {
  const stops = await markStops(container);
  const count = Math.max(presses, stops.length * 2 + 2);

  for (const key of ["Tab", "Shift+Tab"]) {
    const visited: string[] = [];
    const reached = new Set<string>();
    for (let i = 0; i < count; i += 1) {
      await page.keyboard.press(key);
      const where = await describeFocus(page);
      expect(
        await focusIsIn(container),
        `${key} #${i + 1} left the dialog for ${where}`,
      ).toBe(true);
      visited.push(where);
      const stop = await page.evaluate(() =>
        document.activeElement?.getAttribute("data-trap-stop"),
      );
      if (stop) reached.add(stop);
    }
    expect(
      new Set(visited).size,
      `${key} never wrapped: ${visited.join(" > ")}`,
    ).toBeLessThan(visited.length);
    expect(
      stops.filter((_, index) => !reached.has(String(index))),
      `${key} never reached these stops: ${visited.join(" > ")}`,
    ).toEqual([]);
  }
};

// From the container's first stop, Tab must reach every next stop in DOM
// order, to the last one: no positive tabIndex sending it ahead.
const expectTabInDomOrder = async (page: Page, container: Locator) => {
  const stops = await markStops(container);
  // A dialog of one or two stops would make the walk check nothing.
  expect(stops.length).toBeGreaterThan(2);

  await container.locator('[data-trap-stop="0"]').focus();
  for (let index = 1; index < stops.length; index += 1) {
    await page.keyboard.press("Tab");
    const stop = await page.evaluate(() =>
      document.activeElement?.getAttribute("data-trap-stop"),
    );
    expect(
      stop,
      `Tab from ${stops[index - 1]} went to ${await describeFocus(page)}, not ${stops[index]}`,
    ).toBe(String(index));
  }
};

// Tabs forward until the focused element has this test id.
const tabToTestId = async (page: Page, testId: string, limit = 80) => {
  for (let i = 0; i < limit; i += 1) {
    await page.keyboard.press("Tab");
    const id = await page.evaluate(() =>
      document.activeElement
        ?.closest("[data-testid]")
        ?.getAttribute("data-testid"),
    );
    if (id === testId) return;
  }
  throw new Error(`Tab never reached ${testId}`);
};

// Pins the focused element, the one a closing dialog must hand the focus back
// to: a ":focus" locator would follow the focus around.
const markOpener = async (page: Page) => {
  await page.evaluate(() =>
    document.activeElement?.setAttribute("data-focus-opener", ""),
  );
  return page.locator("[data-focus-opener]");
};

// The files list row the focus is on as a whole (its element id), or null.
const focusedRow = (page: Page) =>
  page.evaluate(() =>
    document.activeElement?.hasAttribute("data-row-focus")
      ? (document.activeElement.closest('[id^="file_"], [id^="folder_"]')?.id ??
        null)
      : null,
  );

// Moves the caret down the list until the focused row shows this text.
const arrowToRow = async (page: Page, text: string) => {
  const rowText = () =>
    page.evaluate(() =>
      document.activeElement?.hasAttribute("data-row-focus")
        ? (document.activeElement.closest('[id^="file_"], [id^="folder_"]')
            ?.textContent ?? "")
        : "",
    );
  // The list may not take the keys yet when the page has just loaded: the
  // first press is repeated until a row holds the focus.
  await expect
    .poll(async () => {
      await page.keyboard.press("ArrowDown");
      return rowText();
    })
    .not.toBe("");
  // Then one row at a time, each press waited for.
  for (let i = 0; i < 20; i += 1) {
    const before = await rowText();
    if (before.includes(text)) return;
    await page.keyboard.press("ArrowDown");
    await expect.poll(rowText).not.toBe(before);
  }
  expect(await rowText()).toContain(text);
};

// The context menu's entry the keyboard is on: the last one, in a submenu.
const menuEntry = (page: Page) => page.locator('[data-focused="true"]').last();

// Walks the open context menu with the arrows to the entry with this name.
const arrowToMenuEntry = async (page: Page, name: string) => {
  const entry = menuEntry(page);
  await expect(entry).toBeVisible();
  for (let i = 0; i < 20; i += 1) {
    if ((await entry.innerText()).trim() === name) return;
    await page.keyboard.press("ArrowDown");
  }
  await expect(entry).toHaveText(name);
};

// Opens Move to from the keyboard: the caret on a row, its context menu
// with Shift+F10, then Move or copy > Move to. Returns that row's id.
const openMoveToFromKeyboard = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
  await expect(page.getByTestId("table-body")).toBeVisible();
  await page.waitForLoadState("networkidle");

  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect.poll(() => focusedRow(page)).not.toBeNull();
  const rowId = await focusedRow(page);

  await page.keyboard.press("Shift+F10");
  await arrowToMenuEntry(page, "Move or copy");
  await page.keyboard.press("ArrowRight");
  await arrowToMenuEntry(page, "Move to");
  await page.keyboard.press("Enter");

  const panel = page.getByTestId("aside").first();
  await expect(panel).toBeVisible();
  await expect.poll(() => focusIsIn(panel)).toBe(true);
  return { rowId, panel };
};

const openRooms = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}/rooms/shared/`);
  await expect(page.getByTestId("table-body")).toBeVisible();
  await expect(page.locator(".section-body").first()).toBeFocused();
  await page.waitForLoadState("networkidle");
  // Start every walk at the top of the document.
  await page.mouse.click(1, 1);
};

const modal = (page: Page, has: Locator) =>
  page.locator('[role="dialog"][aria-modal="true"]').filter({ has });

test.describe("Focus trap in modal dialogs", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      filesSettingsHandler(TEST_PORT),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
    );
  });

  test("a dialog with many controls keeps the focus, and Escape hands it back to the opener", async ({
    page,
    baseUrl,
  }) => {
    await openRooms(page, baseUrl);

    await tabToTestId(page, "main-button");
    const opener = await markOpener(page);
    await page.keyboard.press("Enter");

    const roomTypes = page.getByTestId("room-type-list-item");
    await expect(roomTypes.first()).toBeVisible();
    const dialog = modal(page, roomTypes.first());

    await expectFocusTrapped(page, dialog, 40);

    await page.keyboard.press("Escape");
    await expect(roomTypes).toHaveCount(0);
    await expect(opener).toBeFocused();

    // Opened again, it traps the focus again.
    await page.keyboard.press("Enter");
    await expect(roomTypes.first()).toBeVisible();
    await expectFocusTrapped(page, modal(page, roomTypes.first()), 40);
  });

  // A data room's settings carried positive tabIndex values in the middle of
  // the dialog: the retention field (1) came before the name (2), and from
  // the tags (2) Tab went to Cancel (5), past the five toggles between them.
  test("Tab goes through a new data room's settings in their order", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(roomTagsHandler(TEST_PORT));
    await openRooms(page, baseUrl);
    await page.getByTestId("main-button").click();
    await page
      .getByTestId("room-type-list-item")
      .filter({ hasText: "Virtual Data Room" })
      .click();

    const save = page.getByTestId("create_room_dialog_save");
    await expect(save).toBeVisible();

    await expectTabInDomOrder(page, modal(page, save));
  });

  test("the filter panel keeps the focus while it is open", async ({
    page,
    baseUrl,
  }) => {
    await openRooms(page, baseUrl);

    await tabToTestId(page, "filter_icon_button");
    const opener = await markOpener(page);
    await page.keyboard.press("Enter");

    const apply = page.getByTestId("filter_apply_button");
    await expect(apply).toBeVisible();
    const panel = page
      .locator('[role="dialog"][aria-modal="true"], aside')
      .filter({ has: apply })
      .last();

    await expectFocusTrapped(page, panel, 40);

    await page.keyboard.press("Escape");
    await expect(apply).toBeHidden();
    await expect(opener).toBeFocused();
  });
});

test.describe("Focus trap in a files dialog", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      http.get(FOLDER_ENDPOINT, () => myDocumentsResolver(true)),
    );
  });

  test("a short dialog keeps Tab and Shift+Tab inside: New folder", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await expect(page.getByTestId("table-body")).toBeVisible();

    await page.getByTestId("main-button").click();
    await page
      .locator('[role="menuitem"]')
      .filter({ hasText: "Folder" })
      .first()
      .click();

    const input = page.getByTestId("new_folder_text_input");
    await expect(input).toBeFocused();
    const dialog = modal(page, input);

    await expectFocusTrapped(page, dialog);
  });
});

test.describe("Focus trap in the media viewer", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      http.get(FOLDER_ENDPOINT, () => myDocumentsResolver(true)),
    );
  });

  test("the viewer takes the first Tab from the page behind and keeps it", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    // An image: the viewer opens over the list and takes the focus, so the
    // keys no longer reach the page behind it.
    await table
      .getByTestId(`files-cell-name-${JPG_ROW}`)
      .locator(".item-file-name")
      .click();
    // Its root has no height of its own (the parts inside are fixed), so it
    // is waited for by its address and its presence, not its visibility.
    await expect(page).toHaveURL(/\/media\/view\//);
    const viewer = page.getByTestId("media-viewer");
    await expect(viewer).toHaveAttribute("data-visible", "true");
    await expect
      .poll(() =>
        viewer.evaluate((el) => el.contains(document.activeElement)),
      )
      .toBe(true);

    await expectFocusTrapped(page, viewer);
  });

  // Opened from the keyboard, the viewer gives the focus back to the row it
  // was opened from when it closes, so the arrows go on from there.
  test("opened with Enter on a row, the viewer gives the focus back to that row on Escape", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();
    await page.waitForLoadState("networkidle");

    const title = (
      await table
        .getByTestId(`files-cell-name-${JPG_ROW}`)
        .locator(".item-file-name")
        .innerText()
    ).trim();
    await arrowToRow(page, title);
    const rowId = await focusedRow(page);

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/media\/view\//);
    const viewer = page.getByTestId("media-viewer");
    await expect(viewer).toHaveAttribute("data-visible", "true");
    await expect
      .poll(() =>
        viewer.evaluate((el) => el.contains(document.activeElement)),
      )
      .toBe(true);

    await page.keyboard.press("Escape");
    await expect(page).not.toHaveURL(/\/media\/view\//);
    await expect.poll(() => focusedRow(page)).toBe(rowId);
  });
});

test.describe("Focus trap in the files selector", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      roomTagsHandler(TEST_PORT),
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
    );
  });

  test("Move to: Tab reaches the header and the footer, not only the list", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    const row = page.getByTestId("table-body").getByTestId("table-row-3");
    await expect(row).toBeVisible();

    await row.getByTestId("context-menu-button").click();
    await page.getByTestId("option_move-or-copy").hover();
    await page.getByTestId("option_move-to").click();

    const panel = page.getByTestId("aside").first();
    await expect(panel).toBeVisible();
    // It opens with the focus on the list, where a Tab used to be sent back
    // to the search box every time.
    await expect.poll(() => focusIsIn(panel)).toBe(true);

    await expectFocusTrapped(page, panel);
    await expect(panel.getByRole("button", { name: "Cancel" })).toBeVisible();
  });

  // The panel used to drop the focus on the page's body when it closed, so
  // the keyboard lost its place in the list.
  test("Move to: opened from the row's context menu, Escape gives the focus back to the row", async ({
    page,
    baseUrl,
  }) => {
    const { rowId, panel } = await openMoveToFromKeyboard(page, baseUrl);

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect.poll(() => focusedRow(page)).toBe(rowId);
  });

  test("Move to: closed by its Cancel button from the keyboard, the focus goes back to the row", async ({
    page,
    baseUrl,
  }) => {
    const { rowId, panel } = await openMoveToFromKeyboard(page, baseUrl);

    const cancel = panel.getByRole("button", { name: "Cancel" });
    for (
      let i = 0;
      i < 15 && !(await cancel.evaluate((el) => el === document.activeElement));
      i += 1
    )
      await page.keyboard.press("Tab");
    await expect(cancel).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(panel).toBeHidden();
    await expect.poll(() => focusedRow(page)).toBe(rowId);
  });

  // The row stays able to take the focus back while the panel is open; the
  // pointer moving on to another row must not leave it marked behind.
  test("Move to: after the focus came back, a click on another row leaves no row marked", async ({
    page,
    baseUrl,
  }) => {
    const { rowId, panel } = await openMoveToFromKeyboard(page, baseUrl);
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect.poll(() => focusedRow(page)).toBe(rowId);

    const otherId = await page.evaluate(
      (id) =>
        [...document.querySelectorAll('[id^="file_"]')]
          .map((el) => el.id)
          .find((other) => other !== id),
      rowId,
    );
    await page.locator(`#${otherId}`).click();

    await expect(page.locator("[data-row-focus]")).toHaveCount(0);
    expect(await focusedRow(page)).toBeNull();
  });

  test("Move to: the list, its crumbs and its rows work from the keyboard", async ({
    page,
    baseUrl,
  }) => {
    const moves: string[] = [];
    page.on("request", (request) => {
      if (/fileops\/move/.test(request.url())) moves.push(request.url());
    });

    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    const row = page.getByTestId("table-body").getByTestId("table-row-3");
    await expect(row).toBeVisible();
    await row.getByTestId("context-menu-button").click();
    await page.getByTestId("option_move-or-copy").hover();
    await page.getByTestId("option_move-to").click();

    const panel = page.getByTestId("aside").first();
    const list = panel.getByRole("listbox");

    // The list is the one stop for all its rows, and shows which one the
    // keyboard is on.
    await expect(list).toBeFocused();
    await expect(list).toHaveAttribute("aria-activedescendant", /option/);

    const activeOption = () =>
      list.evaluate((el) => {
        const id = el.getAttribute("aria-activedescendant");
        return id ? (document.getElementById(id)?.textContent ?? "") : "";
      });

    // Up to the root through the crumb, from the keyboard.
    const apps = panel.getByRole("link", { name: "Apps" });
    for (
      let i = 0;
      i < 6 && !(await apps.evaluate((el) => el === document.activeElement));
      i += 1
    )
      await page.keyboard.press("Shift+Tab");
    await expect(apps).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(panel.locator('[aria-current="page"]')).toHaveText("Apps");

    // Down the list to Rooms with the arrows, and into it with Enter.
    for (
      let i = 0;
      i < 6 && !(await list.evaluate((el) => el === document.activeElement));
      i += 1
    )
      await page.keyboard.press("Tab");
    await expect(list).toBeFocused();
    for (let i = 0; i < 6 && (await activeOption()) !== "Rooms"; i += 1)
      await page.keyboard.press("ArrowDown");
    expect(await activeOption()).toBe("Rooms");

    await page.keyboard.press("Enter");
    await expect(panel.locator('[aria-current="page"]')).toHaveText("Rooms");

    // Opening a row moved nothing, and the panel is still open on the list.
    await expect(list).toBeFocused();
    expect(moves).toEqual([]);

    // The "New room" row opens its menu of room types from the keyboard:
    // the focus goes to the first type, the arrows walk them, and Escape
    // closes the menu alone, giving the focus back to the list.
    await page.keyboard.press("Home");
    await expect.poll(activeOption).toContain("New room");
    await page.keyboard.press("Enter");
    const types = page.getByTestId("room-type-dropdown-item");
    await expect(types.first()).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(types.nth(1)).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(types).toHaveCount(0);
    await expect(list).toBeFocused();
    // The keyboard is back on the row it opened the menu from.
    await expect.poll(activeOption).toContain("New room");
    await expect(panel).toBeVisible();

    // Enter on a type picks it: the name row opens with the focus in its
    // field. The press is the menu's alone - the Selector, which submits on
    // an Enter keyup, moves nothing.
    await page.keyboard.press("Enter");
    await expect(types.first()).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(types).toHaveCount(0);
    await expect(panel.getByPlaceholder("Enter name")).toBeFocused();
    await page.waitForTimeout(300);
    expect(moves).toEqual([]);
    await expect(panel).toBeVisible();
  });

  test("Move to: the new folder's name row is done or cancelled from the keyboard", async ({
    page,
    baseUrl,
  }) => {
    const creates: string[] = [];
    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        /\/files\/folder\//.test(request.url())
      )
        creates.push(request.url());
    });

    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    const row = page.getByTestId("table-body").getByTestId("table-row-3");
    await expect(row).toBeVisible();
    await row.getByTestId("context-menu-button").click();
    await page.getByTestId("option_move-or-copy").hover();
    await page.getByTestId("option_move-to").click();

    const panel = page.getByTestId("aside").first();
    await expect(panel.getByRole("listbox")).toBeFocused();

    // The list's first row starts a new folder.
    await page.keyboard.press("Home");
    await page.keyboard.press("Enter");
    const name = panel.getByTestId("selector_input_item");
    await expect(name).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(panel.getByRole("button", { name: "Done" })).toBeFocused();
    await page.keyboard.press("Tab");
    const cancel = panel.getByRole("button", { name: "Cancel" }).first();
    await expect(cancel).toBeFocused();

    // Enter on cancel cancels: the row goes, nothing is created, and the
    // focus goes back to the list rather than the page.
    await page.keyboard.press("Enter");
    await expect(name).toHaveCount(0);
    expect(creates).toEqual([]);
    await expect(panel.getByRole("listbox")).toBeFocused();
  });
});

test.describe("Focus trap in nested dialogs", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
      roomGroupsHandler(TEST_PORT, true),
      roomGroupByIdHandler(TEST_PORT),
    );
  });

  test("a panel opened from a dialog holds the focus, then the dialog does again", async ({
    page,
    baseUrl,
  }) => {
    await openRooms(page, baseUrl);

    await page.locator('[class*="groupManagementButton"]').click();
    const createGroup = page.getByTestId("create_new_group_button");
    await expect(createGroup).toBeVisible();
    const groupsDialog = modal(page, createGroup);

    await expectFocusTrapped(page, groupsDialog);

    await createGroup.click();
    const roomSelector = page.getByTestId("room_selector");
    await expect(roomSelector).toBeVisible();
    const selectorPanel = page
      .locator('[role="dialog"][aria-modal="true"], aside')
      .filter({ has: roomSelector })
      .last();

    await expectFocusTrapped(page, selectorPanel, 40);
  });
});
