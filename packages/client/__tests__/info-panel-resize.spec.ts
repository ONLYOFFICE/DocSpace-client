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

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The info panel's resizable edge (Section `isInfoPanelResizable`), on the
 * screens it has to work on.
 *
 * On a desktop the edge drags the panel from 400px up to 800px while the list
 * keeps 416px, the width is kept in localStorage, a window too narrow for it
 * narrows the panel without saving that, and a double click restores 400px.
 * The width also reaches what the app pins to the bottom corner: the Zendesk
 * launcher is moved clear of the panel by exactly its width. Below a desktop
 * the panel is an overlay and has no edge to drag.
 */

const FILES_URL = "/rooms/personal/filter?folder=12764";
const WIDTH_KEY = "infoPanelWidth";

const DEFAULT_WIDTH = 400;
const MAX_WIDTH = 800;
const SECTION_MIN_WIDTH = 416;
/** The name column's own minimum (Home TableHeader `minWidth`). */
const NAME_MIN_WIDTH = 210;

const WIDE = { width: 1920, height: 1080 };
const SMALL_DESKTOP = { width: 1280, height: 800 };
const TABLET = { width: 900, height: 1180 };
const PHONE = { width: 428, height: 830 };

const ZENDESK_KEY = "e2e-zendesk-key";
const ZENDESK_SNIPPET_URL = "**/ekr/snippet.js*";

type ZendeskCommand = { product: string; command: string; arg?: unknown };

const mockPortal = () => [
  rootHandler(TEST_PORT),
  filesSettingsHandler(TEST_PORT),
  settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone, {
    zendeskKey: ZENDESK_KEY,
  }),
  selfByTypeHandler(TEST_PORT, "owner"),
  selfActivationStatusHandler(TEST_PORT, null, false, true),
  myHandler(TEST_PORT, true),
  myDocumentsHandler(TEST_PORT, true),
];

/** Zendesk's CDN, answered by a widget that only records what it is asked. */
const stubZendeskRecorder = (page: Page) =>
  page.route(ZENDESK_SNIPPET_URL, (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `(() => {
        window.__zendeskCommands = [];
        window.zE = (product, command, arg) => {
          window.__zendeskCommands.push({ product, command, arg });
        };
      })();`,
    }),
  );

const launcherOffset = async (page: Page) => {
  const commands = await page.evaluate(
    () =>
      (window as unknown as { __zendeskCommands?: ZendeskCommand[] })
        .__zendeskCommands ?? [],
  );
  const placement = commands
    .filter(
      (c) => c.product === "messenger:set" && c.command === "customization",
    )
    .at(-1);

  return (
    placement?.arg as
      | { position: { offset: { web: { horizontal: number } } } }
      | undefined
  )?.position.offset.web.horizontal;
};

const resizer = (page: Page) => page.getByTestId("info-panel-resizer");
const panel = (page: Page) => page.locator("#InfoPanelWrapper");

/** The width `--info-panel-width` gives the panel: its content box. */
const panelWidth = (page: Page) =>
  resizer(page).evaluate((el) =>
    Math.round(parseFloat(getComputedStyle(el.parentElement!).width)),
  );

const sectionWidth = (page: Page) =>
  page
    .locator("#section")
    .evaluate((el) => Math.round(el.getBoundingClientRect().width));

const storedWidth = (page: Page) =>
  page.evaluate((key) => localStorage.getItem(key), WIDTH_KEY);

const presetWidth = (page: Page, width: number) =>
  page.addInitScript(
    ([key, value]) => localStorage.setItem(key, value),
    [WIDTH_KEY, String(width)],
  );

const setPanelOpen = async (page: Page, open: boolean) => {
  const toggle = page.locator(".info-panel-toggle").first();
  await expect(toggle).toBeVisible();

  if ((await panel(page).isVisible()) !== open) await toggle.click();

  if (open) await expect(panel(page)).toBeVisible();
  else await expect(panel(page)).toBeHidden();
};

/** Below a desktop the header has no toggle: the panel opens from an item's menu. */
const openPanelFromMenu = async (page: Page) => {
  await page
    .locator("#section")
    .getByTestId("context-menu-button")
    .first()
    .click();

  const showInfo = page.getByTestId("option_show-info");
  const info = page.getByTestId("option_info");
  await expect(showInfo.or(info).first()).toBeVisible();
  if (await info.isVisible()) await info.click();

  await showInfo.click();
  await expect(panel(page)).toBeVisible();
};

const isDesktopLayout = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

/** A drag of the edge by a finger, as pointer events with `pointerType: "touch"`. */
const touchDragEdge = async (page: Page, dx: number) => {
  const box = await resizer(page).boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const touch = { pointerId: 7, pointerType: "touch", isPrimary: true };

  await resizer(page).dispatchEvent("pointerdown", {
    ...touch,
    button: 0,
    clientX: x,
    clientY: y,
    bubbles: true,
  });
  await page.evaluate(
    ([init, to]) => {
      window.dispatchEvent(
        new PointerEvent("pointermove", { ...init, clientX: to }),
      );
      window.dispatchEvent(
        new PointerEvent("pointerup", { ...init, clientX: to }),
      );
    },
    [touch, x + dx] as const,
  );
};

const openFiles = async (
  page: Page,
  baseUrl: string,
  viewport: { width: number; height: number },
) => {
  await page.setViewportSize(viewport);
  await page.goto(`${baseUrl}${FILES_URL}`);
  await expect(page.locator("#section")).toBeVisible();
};

/** A mouse drag of the edge by `dx` pixels; negative widens the panel in LTR. */
const dragEdge = async (page: Page, dx: number) => {
  const box = await resizer(page).boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y, { steps: 8 });
  await page.mouse.up();
};

test.describe("Info panel resize on a desktop", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(...mockPortal());
  });

  test("widens from its edge, keeps the width across a reload and stops at the cap", async ({
    page,
    baseUrl,
  }) => {
    await openFiles(page, baseUrl, WIDE);
    await setPanelOpen(page, true);
    await expect.poll(() => panelWidth(page)).toBe(DEFAULT_WIDTH);

    await dragEdge(page, -200);
    await expect.poll(() => panelWidth(page)).toBe(DEFAULT_WIDTH + 200);
    expect(await storedWidth(page)).toBe(String(DEFAULT_WIDTH + 200));

    await page.reload();
    await setPanelOpen(page, true);
    await expect.poll(() => panelWidth(page)).toBe(DEFAULT_WIDTH + 200);

    await dragEdge(page, -700);
    await expect.poll(() => panelWidth(page)).toBe(MAX_WIDTH);
    expect(await storedWidth(page)).toBe(String(MAX_WIDTH));
    expect(await sectionWidth(page)).toBeGreaterThanOrEqual(SECTION_MIN_WIDTH);
  });

  test("stays put on a click and goes back to the default on a double click", async ({
    page,
    baseUrl,
  }) => {
    await presetWidth(page, 700);
    await openFiles(page, baseUrl, WIDE);
    await setPanelOpen(page, true);
    await expect.poll(() => panelWidth(page)).toBe(700);

    await resizer(page).click();
    expect(await panelWidth(page)).toBe(700);
    expect(await storedWidth(page)).toBe("700");

    await resizer(page).dblclick();
    await expect.poll(() => panelWidth(page)).toBe(DEFAULT_WIDTH);
    expect(await storedWidth(page)).toBe(String(DEFAULT_WIDTH));
  });

  test("narrows to fit a smaller window without saving it, and widens back", async ({
    page,
    baseUrl,
  }) => {
    await presetWidth(page, MAX_WIDTH);
    await openFiles(page, baseUrl, WIDE);
    await setPanelOpen(page, true);
    await expect.poll(() => panelWidth(page)).toBe(MAX_WIDTH);

    await page.setViewportSize(SMALL_DESKTOP);
    await expect.poll(() => panelWidth(page)).toBeLessThan(MAX_WIDTH);
    await expect
      .poll(() => sectionWidth(page))
      .toBeGreaterThanOrEqual(SECTION_MIN_WIDTH - 1);
    expect(await storedWidth(page)).toBe(String(MAX_WIDTH));

    await page.setViewportSize(WIDE);
    await expect.poll(() => panelWidth(page)).toBe(MAX_WIDTH);
  });

  test("moves the live chat launcher clear of the panel as it widens", async ({
    page,
    baseUrl,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem("live_chat_state", "true"),
    );
    await stubZendeskRecorder(page);
    await openFiles(page, baseUrl, WIDE);

    await setPanelOpen(page, false);
    await expect.poll(() => launcherOffset(page)).toBeDefined();
    const closed = (await launcherOffset(page)) as number;

    await setPanelOpen(page, true);
    await expect.poll(() => launcherOffset(page)).toBe(closed + DEFAULT_WIDTH);

    await dragEdge(page, -250);
    await expect
      .poll(() => launcherOffset(page))
      .toBe(closed + DEFAULT_WIDTH + 250);

    await setPanelOpen(page, false);
    await expect.poll(() => launcherOffset(page)).toBe(closed);
  });

  test("keeps the name column when the panel leaves the list little room", async ({
    page,
    baseUrl,
  }) => {
    await presetWidth(page, MAX_WIDTH);
    await openFiles(page, baseUrl, SMALL_DESKTOP);
    await setPanelOpen(page, true);
    await expect
      .poll(() => sectionWidth(page))
      .toBeLessThan(SECTION_MIN_WIDTH + 40);

    const header = page.getByTestId("table-header");
    await expect(header).toBeVisible();

    await expect
      .poll(() => header.evaluate((el) => el.style.gridTemplateColumns))
      .not.toBe("");

    const columns = await header.evaluate((el) =>
      el.style.gridTemplateColumns.split(" ").map((size) => parseFloat(size)),
    );
    expect(columns[0]).toBeGreaterThanOrEqual(NAME_MIN_WIDTH);
    expect(columns.every((size) => size >= 0)).toBe(true);
    await expect(
      page.getByTestId("table-body").locator(".table-row").first(),
    ).toBeVisible();
  });
});

test.describe("Info panel resize on a touch screen", () => {
  test.use({ hasTouch: true });

  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(...mockPortal());
  });

  test("follows a finger on the edge", async ({ page, baseUrl }) => {
    await openFiles(page, baseUrl, WIDE);
    await setPanelOpen(page, true);
    await expect.poll(() => panelWidth(page)).toBe(DEFAULT_WIDTH);

    await touchDragEdge(page, -150);

    await expect.poll(() => panelWidth(page)).toBe(DEFAULT_WIDTH + 150);
    expect(await storedWidth(page)).toBe(String(DEFAULT_WIDTH + 150));
  });
});

test.describe("Info panel below a desktop", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(...mockPortal());
  });

  for (const [name, viewport] of [
    ["tablet", TABLET],
    ["phone", PHONE],
  ] as const) {
    test(`has no edge to drag on a ${name}`, async ({ page, baseUrl }) => {
      await presetWidth(page, 700);
      await openFiles(page, baseUrl, viewport);
      await openPanelFromMenu(page);

      await expect(resizer(page)).toHaveCount(0);
      expect(await storedWidth(page)).toBe("700");
    });
  }
});

test.describe("Info panel on a device", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(...mockPortal());
  });

  test("offers the edge only where the layout is a desktop, and takes a finger", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${FILES_URL}`);
    await expect(page.locator("#section")).toBeVisible();

    if (!isDesktopLayout(page)) {
      await openPanelFromMenu(page);
      await expect(resizer(page)).toHaveCount(0);
      return;
    }

    await setPanelOpen(page, true);
    await expect(resizer(page)).toBeVisible();
    await expect.poll(() => panelWidth(page)).toBe(DEFAULT_WIDTH);

    await touchDragEdge(page, -100);

    await expect.poll(() => panelWidth(page)).toBe(DEFAULT_WIDTH + 100);
    expect(await sectionWidth(page)).toBeGreaterThanOrEqual(SECTION_MIN_WIDTH);
  });
});
